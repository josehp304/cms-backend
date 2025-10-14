import { Router, Request, Response } from 'express';
import { db } from '../db';
import { branch, type NewBranch } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// CREATE - Add new branch
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchData: NewBranch = {
      name: req.body.name,
      contact_no: req.body.contact_no,
      address: req.body.address,
      gmap_link: req.body.gmap_link,
      room_rate: req.body.room_rate,
      prime_location_perks: req.body.prime_location_perks,
      amenities: req.body.amenities,
      property_features: req.body.property_features,
      reg_fee: req.body.reg_fee,
      is_mess_available: req.body.is_mess_available,
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
    const branches = await db.select().from(branch);
    
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

// UPDATE - Update branch by ID
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = parseInt(req.params.id || '0');
    
    if (isNaN(branchId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid branch ID',
      });
      return;
    }

    const updateData: Partial<NewBranch> = {
      ...req.body,
      updated_at: new Date(),
    };

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
