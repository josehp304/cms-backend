import { Router, Request, Response } from 'express';
import { db } from '../db';
import { gallery, branch, type NewGallery } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import multer from 'multer';
// Use native fetch + global FormData/Blob (Node 18+)

// Multer setup (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// CREATE - Add new gallery image
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const galleryData: NewGallery = {
      branch_id: req.body.branch_id,
      image_url: req.body.image_url,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
      display_order: req.body.display_order,
    };

    const newGallery = await db.insert(gallery).values(galleryData).returning();
    
    res.status(201).json({
      success: true,
      data: newGallery[0],
      message: 'Gallery image created successfully',
    });
  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create gallery image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// UPLOAD - Accept an image file, upload to ImageHippo, store returned URL in DB
// Accepts multipart/form-data: file (image), branch_id OR branch_name, title, description, tags
// Augment Request type locally for multer
type MulterRequest = Request & { file?: any };

router.post('/upload', upload.single('file'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded (field name: file)' });
      return;
    }

    const { branch_id, branch_name, title, description, tags, display_order } = req.body;

    const imageHippoUrl = process.env.IMAGEHIPPO_UPLOAD_URL || 'https://api.imghippo.com/v1/upload';
    const imageHippoKey = (process.env.IMAGEHIPPO_API_KEY || process.env.IMGHIPPO_API_KEY || '').trim();
    if (!imageHippoKey) {
      res.status(500).json({ success: false, error: 'IMAGEHIPPO_API_KEY/IMGHIPPO_API_KEY is missing on server' });
      return;
    }

    // Build multipart using global FormData/Blob so fetch sets Content-Type and boundary automatically
    const fd = new (globalThis as any).FormData();
    fd.append('api_key', imageHippoKey);
    const blob = new (globalThis as any).Blob([req.file.buffer], { type: req.file.mimetype });
    // 3rd arg as filename is supported in WHATWG FormData
    fd.append('file', blob, req.file.originalname);
    if (title) fd.append('title', title);

    const uploadResp = await fetch(imageHippoUrl, {
      method: 'POST',
      body: fd as any,
    });

    // Read body once; try JSON, fallback to text
    const rawText = await uploadResp.text();
    let parsed: any;
    try { parsed = JSON.parse(rawText); } catch { parsed = undefined; }

    if (!uploadResp.ok) {
      res.status(uploadResp.status).json({
        success: false,
        error: 'ImageHippo upload failed',
        details: {
          status: uploadResp.status,
          statusText: uploadResp.statusText,
          response: parsed ?? rawText,
        },
      });
      return;
    }

    const data = parsed ?? {};
    const returnedUrl = data?.data?.view_url || data?.data?.url;

    if (!data?.success || !returnedUrl) {
      res.status(502).json({
        success: false,
        error: 'Failed to get image URL from ImageHippo',
        details: data,
      });
      return;
    }

    // Resolve branch
    let finalBranchId: number | undefined = undefined;
    if (branch_id) {
      const parsedId = parseInt(branch_id as string, 10);
      if (!isNaN(parsedId)) finalBranchId = parsedId;
    }
    if (!finalBranchId && branch_name) {
      const branchResult = await db.select().from(branch).where(eq(branch.name, branch_name)).limit(1);
      if (Array.isArray(branchResult) && branchResult.length > 0) {
        const first = branchResult[0];
        if (first && typeof first.id === 'number') {
          finalBranchId = first.id;
        }
      }
    }
    if (!finalBranchId) {
      res.status(400).json({ success: false, error: 'branch_id or branch_name is required and must exist' });
      return;
    }

    const galleryData: NewGallery = {
      branch_id: finalBranchId,
      image_url: returnedUrl,
      title: title ?? null,
      description: description ?? null,
      tags: tags ? (Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim())) : undefined,
      display_order: display_order ? parseInt(display_order as string, 10) : undefined,
    } as NewGallery;

    const newGallery = await db.insert(gallery).values(galleryData).returning();

    res.status(201).json({ success: true, data: newGallery[0], message: 'Image uploaded and saved to gallery' });
  } catch (error) {
    console.error('Error uploading image to ImageHippo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image to ImageHippo',
      details: error instanceof Error ? error.message : 'Unknown',
    });
  }
});

// READ - Get all gallery images
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { branch_id } = req.query;
    
    let galleryData;
    if (branch_id) {
      const branchId = parseInt(branch_id as string);
      if (isNaN(branchId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid branch ID',
        });
        return;
      }
      galleryData = await db
        .select()
        .from(gallery)
        .where(eq(gallery.branch_id, branchId));
    } else {
      galleryData = await db.select().from(gallery);
    }
    
    res.status(200).json({
      success: true,
      data: galleryData,
      count: galleryData.length,
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gallery images',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// READ - Get single gallery image by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const galleryId = parseInt(req.params.id || '0');
    
    if (isNaN(galleryId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid gallery ID',
      });
      return;
    }

    const galleryData = await db
      .select()
      .from(gallery)
      .where(eq(gallery.id, galleryId))
      .limit(1);

    if (galleryData.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Gallery image not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: galleryData[0],
    });
  } catch (error) {
    console.error('Error fetching gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch gallery image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// UPDATE - Update gallery image by ID
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const galleryId = parseInt(req.params.id || '0');
    
    if (isNaN(galleryId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid gallery ID',
      });
      return;
    }

    const updateData: Partial<NewGallery> = req.body;

    const updatedGallery = await db
      .update(gallery)
      .set(updateData)
      .where(eq(gallery.id, galleryId))
      .returning();

    if (updatedGallery.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Gallery image not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedGallery[0],
      message: 'Gallery image updated successfully',
    });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update gallery image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE - Delete gallery image by ID
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const galleryId = parseInt(req.params.id || '0');
    
    if (isNaN(galleryId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid gallery ID',
      });
      return;
    }

    const deletedGallery = await db
      .delete(gallery)
      .where(eq(gallery.id, galleryId))
      .returning();

    if (deletedGallery.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Gallery image not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedGallery[0],
      message: 'Gallery image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete gallery image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// BRANCH-SPECIFIC ENDPOINTS

// GET - Get all gallery images for a specific branch
router.get('/branch/:branchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.branchId || '0');
    
    if (isNaN(branchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID',
      });
      return;
    }

    const galleryData = await db
      .select()
      .from(gallery)
      .where(eq(gallery.branch_id, branchId))
      .orderBy(gallery.display_order);
    
    res.status(200).json({
      success: true,
      data: galleryData,
      count: galleryData.length,
    });
  } catch (error) {
    console.error('Error fetching branch gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch gallery images',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST - Add new gallery image to a specific branch
router.post('/branch/:branchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.branchId || '0');
    
    if (isNaN(branchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID',
      });
      return;
    }

    const galleryData: NewGallery = {
      branch_id: branchId,
      image_url: req.body.image_url,
      title: req.body.title,
      description: req.body.description,
      tags: req.body.tags,
      display_order: req.body.display_order,
    };

    const newGallery = await db.insert(gallery).values(galleryData).returning();
    
    res.status(201).json({
      success: true,
      data: newGallery[0],
      message: 'Gallery image added to branch successfully',
    });
  } catch (error) {
    console.error('Error adding gallery image to branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add gallery image to branch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT - Update gallery image for a specific branch
router.put('/branch/:branchId/image/:imageId', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.branchId || '0');
    const imageId = parseInt(req.params.imageId || '0');
    
    if (isNaN(branchId) || isNaN(imageId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID or image ID',
      });
      return;
    }

    const updateData: Partial<NewGallery> = req.body;
    // Ensure branch_id cannot be changed
    delete updateData.branch_id;

    const updatedGallery = await db
      .update(gallery)
      .set(updateData)
      .where(and(
        eq(gallery.id, imageId),
        eq(gallery.branch_id, branchId)
      ))
      .returning();

    if (updatedGallery.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Gallery image not found for this branch',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedGallery[0],
      message: 'Branch gallery image updated successfully',
    });
  } catch (error) {
    console.error('Error updating branch gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update branch gallery image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE - Delete gallery image from a specific branch
router.delete('/branch/:branchId/image/:imageId', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.branchId || '0');
    const imageId = parseInt(req.params.imageId || '0');
    
    if (isNaN(branchId) || isNaN(imageId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID or image ID',
      });
      return;
    }

    const deletedGallery = await db
      .delete(gallery)
      .where(and(
        eq(gallery.id, imageId),
        eq(gallery.branch_id, branchId)
      ))
      .returning();

    if (deletedGallery.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Gallery image not found for this branch',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedGallery[0],
      message: 'Gallery image removed from branch successfully',
    });
  } catch (error) {
    console.error('Error deleting branch gallery image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete branch gallery image',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE - Delete all gallery images for a specific branch
router.delete('/branch/:branchId', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.branchId || '0');
    
    if (isNaN(branchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID',
      });
      return;
    }

    const deletedGallery = await db
      .delete(gallery)
      .where(eq(gallery.branch_id, branchId))
      .returning();

    res.status(200).json({
      success: true,
      count: deletedGallery.length,
      message: `All gallery images (${deletedGallery.length}) removed from branch successfully`,
    });
  } catch (error) {
    console.error('Error deleting all branch gallery images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all branch gallery images',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE IMAGE FROM IMAGEHIPPO - Delete image from ImageHippo hosting service
router.delete('/delete-from-host', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image_url } = req.body;
    if (!image_url) {
      res.status(400).json({ success: false, error: 'image_url is required' });
      return;
    }

    const imageHippoDeleteUrl = process.env.IMAGEHIPPO_DELETE_URL || 'https://api.imghippo.com/v1/delete';
    const imageHippoKey = (process.env.IMAGEHIPPO_API_KEY || process.env.IMGHIPPO_API_KEY || '').trim();
    if (!imageHippoKey) {
      res.status(500).json({ success: false, error: 'IMAGEHIPPO_API_KEY/IMGHIPPO_API_KEY is missing on server' });
      return;
    }

    const fd = new (globalThis as any).FormData();
    fd.append('api_key', imageHippoKey);
    fd.append('url', image_url);

    const deleteResp = await fetch(imageHippoDeleteUrl, {
      method: 'POST',
      body: fd as any,
    });

    const rawText = await deleteResp.text();
    let parsed: any;
    try { parsed = JSON.parse(rawText); } catch { parsed = undefined; }

    if (!deleteResp.ok) {
      res.status(deleteResp.status).json({
        success: false,
        error: 'Failed to delete image from ImageHippo',
        details: {
          status: deleteResp.status,
          statusText: deleteResp.statusText,
          response: parsed ?? rawText,
        },
      });
      return;
    }

    // Return raw parsed data from ImageHippo to keep behavior similar to Next.js example
    res.status(200).json({
      success: true,
      data: parsed ?? rawText,
    });
  } catch (error) {
    console.error('Error deleting image from ImageHippo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image from ImageHippo',
      details: error instanceof Error ? error.message : 'Unknown',
    });
  }
});

export default router;

