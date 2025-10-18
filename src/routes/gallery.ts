import { Router, Request, Response } from 'express';
import { db } from '../db';
import { gallery, branch, type NewGallery } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Multer setup (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || '',
  api_key: process.env.CLOUDINARY_CLOUD_KEY || '',
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET || '',
});

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

// UPLOAD - Accept an image file, upload to Cloudinary, store returned URL in DB
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

    // Upload to Cloudinary using upload_stream
    const uploadPromise = new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'gallery',
          resource_type: 'auto',
          public_id: title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.pipe(stream);
    });

    const uploadResult = await uploadPromise;
    const returnedUrl = uploadResult.secure_url;

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

    res.status(201).json({ 
      success: true, 
      data: newGallery[0], 
      cloudinary: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
      },
      message: 'Image uploaded to Cloudinary and saved to gallery' 
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image to Cloudinary',
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

// DELETE IMAGE FROM CLOUDINARY - Delete image from Cloudinary hosting service
router.delete('/delete-from-host', async (req: Request, res: Response): Promise<void> => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      res.status(400).json({ success: false, error: 'public_id is required' });
      return;
    }

    // Delete from Cloudinary using public_id
    const deleteResult = await cloudinary.uploader.destroy(public_id);

    if (deleteResult.result === 'ok' || deleteResult.result === 'not found') {
      res.status(200).json({
        success: true,
        message: deleteResult.result === 'ok' ? 'Image deleted from Cloudinary successfully' : 'Image not found in Cloudinary',
        data: deleteResult,
      });
    } else {
      res.status(502).json({ 
        success: false, 
        error: 'Failed to delete image from Cloudinary', 
        details: deleteResult 
      });
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image from Cloudinary',
      details: error instanceof Error ? error.message : 'Unknown',
    });
  }
});

export default router;

