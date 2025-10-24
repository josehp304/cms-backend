import { Router, Request, Response } from 'express';
import { db } from '../db';
import { branch, type NewBranch } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || '',
  api_key: process.env.CLOUDINARY_CLOUD_KEY || '',
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET || '',
});

// Configure multer for in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Type for multer request
type MulterRequest = Request & { file?: Express.Multer.File | undefined };

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve({ secure_url: result.secure_url, public_id: result.public_id });
        else reject(new Error('Upload failed'));
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

const router = Router();

// CREATE - Add new branch with optional thumbnail upload
router.post('/', upload.single('thumbnail'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    let thumbnailUrl: string | undefined;

    // If thumbnail file is provided, upload to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'branch-thumbnails');
        thumbnailUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error uploading thumbnail to Cloudinary:', uploadError);
        res.status(500).json({
          success: false,
          error: 'Failed to upload thumbnail',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        });
        return;
      }
    }

    const branchData: NewBranch = {
      name: req.body.name,
      contact_no: req.body.contact_no ? JSON.parse(req.body.contact_no) : undefined,
      address: req.body.address,
      gmap_link: req.body.gmap_link,
      room_rate: req.body.room_rate ? JSON.parse(req.body.room_rate) : undefined,
      prime_location_perks: req.body.prime_location_perks ? JSON.parse(req.body.prime_location_perks) : undefined,
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : undefined,
      property_features: req.body.property_features ? JSON.parse(req.body.property_features) : undefined,
      reg_fee: req.body.reg_fee ? parseInt(req.body.reg_fee) : undefined,
      is_mess_available: req.body.is_mess_available === 'true',
      is_ladies: req.body.is_ladies === 'true',
      is_cooking: req.body.is_cooking === 'true',
      cooking_price: req.body.cooking_price || undefined,
      display_order: req.body.display_order ? parseInt(req.body.display_order) : undefined,
      thumbnail: thumbnailUrl, // Use uploaded Cloudinary URL
    };

    const newBranch = await db.insert(branch).values(branchData).returning();
    
    res.status(201).json({
      success: true,
      data: newBranch[0],
      message: 'Branch created successfully',
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create branch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// READ - Get all branches
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await db.select().from(branch).orderBy(asc(branch.display_order));
    
    res.status(200).json({
      success: true,
      data: branches,
      count: branches.length,
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branches',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// READ - Get single branch by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id || '0');
    
    if (isNaN(branchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID',
      });
      return;
    }

    const branchData = await db
      .select()
      .from(branch)
      .where(eq(branch.id, branchId))
      .limit(1);

    if (branchData.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Branch not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: branchData[0],
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch branch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// UPDATE - Update branch by ID with optional thumbnail upload
router.put('/:id', upload.single('thumbnail'), async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id || '0');
    
    if (isNaN(branchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID',
      });
      return;
    }

    let thumbnailUrl: string | undefined;

    // If thumbnail file is provided, upload to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'branch-thumbnails');
        thumbnailUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Error uploading thumbnail to Cloudinary:', uploadError);
        res.status(500).json({
          success: false,
          error: 'Failed to upload thumbnail',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        });
        return;
      }
    }
    console.log('display order change is ', req.body.display_order);
    const updateData: Partial<NewBranch> = {
      name: req.body.name,
      contact_no: req.body.contact_no ? JSON.parse(req.body.contact_no) : undefined,
      address: req.body.address,
      gmap_link: req.body.gmap_link,
      room_rate: req.body.room_rate ? JSON.parse(req.body.room_rate) : undefined,
      prime_location_perks: req.body.prime_location_perks ? JSON.parse(req.body.prime_location_perks) : undefined,
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : undefined,
      property_features: req.body.property_features ? JSON.parse(req.body.property_features) : undefined,
      reg_fee: req.body.reg_fee ? parseInt(req.body.reg_fee) : undefined,
      is_mess_available: req.body.is_mess_available ? req.body.is_mess_available === 'true' : undefined,
      is_ladies: req.body.is_ladies ? req.body.is_ladies === 'true' : undefined,
      is_cooking: req.body.is_cooking ? req.body.is_cooking === 'true' : undefined,
      cooking_price: req.body.cooking_price || undefined,
      display_order: req.body.display_order ? parseInt(req.body.display_order) : undefined,
      thumbnail: thumbnailUrl, // Use uploaded Cloudinary URL if provided
      updated_at: new Date(),
    };
    
    // Remove undefined values to avoid overwriting with undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const updatedBranch = await db
      .update(branch)
      .set(updateData)
      .where(eq(branch.id, branchId))
      .returning();

    if (updatedBranch.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Branch not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedBranch[0],
      message: 'Branch updated successfully',
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update branch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE - Delete branch by ID
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id || '0');
    
    if (isNaN(branchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID',
      });
      return;
    }

    const deletedBranch = await db
      .delete(branch)
      .where(eq(branch.id, branchId))
      .returning();

    if (deletedBranch.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Branch not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedBranch[0],
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete branch',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
