import { Router, Request, Response } from 'express';
import { db } from '../db';
import { user_enquiries, type NewUserEnquiry } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// CREATE - Add new user enquiry
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const enquiryData: NewUserEnquiry = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
      branch_id: req.body.branch_id,
      source: req.body.source || 'website',
    };

    const newEnquiry = await db.insert(user_enquiries).values(enquiryData).returning();
    
    res.status(201).json({
      success: true,
      data: newEnquiry[0],
      message: 'Enquiry submitted successfully',
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit enquiry',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// READ - Get all enquiries
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { branch_id, source } = req.query;
    
    let enquiries;
    if (branch_id) {
      const branchId = parseInt(branch_id as string);
      if (isNaN(branchId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid branch ID',
        });
        return;
      }
      enquiries = await db
        .select()
        .from(user_enquiries)
        .where(eq(user_enquiries.branch_id, branchId));
    } else {
      enquiries = await db.select().from(user_enquiries);
    }
    
    res.status(200).json({
      success: true,
      data: enquiries,
      count: enquiries.length,
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enquiries',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// READ - Get single enquiry by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const enquiryId = parseInt(idParam || '0');
    
    if (isNaN(enquiryId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid enquiry ID',
      });
      return;
    }

    const enquiryData = await db
      .select()
      .from(user_enquiries)
      .where(eq(user_enquiries.id, enquiryId))
      .limit(1);

    if (enquiryData.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: enquiryData[0],
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enquiry',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// UPDATE - Update enquiry by ID
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const enquiryId = parseInt(idParam || '0');
    
    if (isNaN(enquiryId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid enquiry ID',
      });
      return;
    }

    const updateData: Partial<NewUserEnquiry> = req.body;

    const updatedEnquiry = await db
      .update(user_enquiries)
      .set(updateData)
      .where(eq(user_enquiries.id, enquiryId))
      .returning();

    if (updatedEnquiry.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedEnquiry[0],
      message: 'Enquiry updated successfully',
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update enquiry',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE - Delete enquiry by ID
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const enquiryId = parseInt(idParam || '0');
    
    if (isNaN(enquiryId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid enquiry ID',
      });
      return;
    }

    const deletedEnquiry = await db
      .delete(user_enquiries)
      .where(eq(user_enquiries.id, enquiryId))
      .returning();

    if (deletedEnquiry.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Enquiry not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedEnquiry[0],
      message: 'Enquiry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete enquiry',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
