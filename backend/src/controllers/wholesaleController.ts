import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { WholesaleBox, IndividualItem } from '../types';

interface WholesaleBoxData {
  id: string;
  name: string;
  boxCode: string;
  totalUnits: number;
  expiry: Date;
  individualItems: IndividualItem[];
}

class WholesaleController {
  private wholesaleBoxes: WholesaleBoxData[] = [
    {
      id: 'box-001',
      name: 'Amul Milk Box - 500ml',
      boxCode: 'BOX-2024-001',
      totalUnits: 24,
      expiry: new Date('2024-09-25'),
      individualItems: Array.from({ length: 24 }, (_, i) => ({
        id: `item-${i + 1}`,
        name: `Unit ${i + 1}`,
        itemCode: `AMU-500-${String(i + 1).padStart(3, '0')}`,
        expiry: new Date('2024-09-25'),
        sold: i < 3 // First 3 items are sold
      }))
    },
    {
      id: 'box-002',
      name: 'Coca Cola Box - 500ml',
      boxCode: 'BOX-2024-002',
      totalUnits: 48,
      expiry: new Date('2024-11-30'),
      individualItems: Array.from({ length: 48 }, (_, i) => ({
        id: `item-${i + 1}`,
        name: `Unit ${i + 1}`,
        itemCode: `COK-500-${String(i + 1).padStart(3, '0')}`,
        expiry: new Date('2024-11-30'),
        sold: i < 12 // First 12 items are sold
      }))
    }
  ];

  getAllWholesaleBoxes = (req: Request, res: Response): void => {
    try {
      res.json({
        success: true,
        data: this.wholesaleBoxes,
        count: this.wholesaleBoxes.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wholesale boxes',
        error: (error as Error).message
      });
    }
  };

  getWholesaleBoxById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const box = this.wholesaleBoxes.find(box => box.id === id);

      if (!box) {
        res.status(404).json({
          success: false,
          message: 'Wholesale box not found'
        });
        return;
      }

      res.json({
        success: true,
        data: box
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wholesale box',
        error: (error as Error).message
      });
    }
  };

  createWholesaleBox = (req: Request, res: Response): void => {
    try {
      const boxData: Omit<WholesaleBoxData, 'id'> = req.body;

      if (!boxData.name || !boxData.boxCode || !boxData.totalUnits) {
        res.status(400).json({
          success: false,
          message: 'Name, box code, and total units are required'
        });
        return;
      }

      const newBox: WholesaleBoxData = {
        id: uuidv4(),
        ...boxData
      };

      this.wholesaleBoxes.push(newBox);

      res.status(201).json({
        success: true,
        data: newBox,
        message: 'Wholesale box created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create wholesale box',
        error: (error as Error).message
      });
    }
  };

  updateWholesaleBox = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const updateData: Partial<WholesaleBoxData> = req.body;

      const boxIndex = this.wholesaleBoxes.findIndex(box => box.id === id);

      if (boxIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Wholesale box not found'
        });
        return;
      }

      this.wholesaleBoxes[boxIndex] = {
        ...this.wholesaleBoxes[boxIndex],
        ...updateData
      };

      res.json({
        success: true,
        data: this.wholesaleBoxes[boxIndex],
        message: 'Wholesale box updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update wholesale box',
        error: (error as Error).message
      });
    }
  };

  deleteWholesaleBox = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const boxIndex = this.wholesaleBoxes.findIndex(box => box.id === id);

      if (boxIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Wholesale box not found'
        });
        return;
      }

      this.wholesaleBoxes.splice(boxIndex, 1);

      res.json({
        success: true,
        message: 'Wholesale box deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete wholesale box',
        error: (error as Error).message
      });
    }
  };

  sellItem = (req: Request, res: Response): void => {
    try {
      const { boxId, itemId } = req.params;

      const box = this.wholesaleBoxes.find(box => box.id === boxId);
      if (!box) {
        res.status(404).json({
          success: false,
          message: 'Wholesale box not found'
        });
        return;
      }

      const item = box.individualItems.find(item => item.id === itemId);
      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Item not found in wholesale box'
        });
        return;
      }

      if (item.sold) {
        res.status(400).json({
          success: false,
          message: 'Item is already sold'
        });
        return;
      }

      item.sold = true;

      res.json({
        success: true,
        data: item,
        message: 'Item sold successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to sell item',
        error: (error as Error).message
      });
    }
  };

  getWholesaleStats = (req: Request, res: Response): void => {
    try {
      const totalBoxes = this.wholesaleBoxes.length;
      const totalUnits = this.wholesaleBoxes.reduce((sum, box) => sum + box.totalUnits, 0);
      const soldUnits = this.wholesaleBoxes.reduce((sum, box) =>
        sum + box.individualItems.filter(item => item.sold).length, 0);
      const availableUnits = totalUnits - soldUnits;

      res.json({
        success: true,
        data: {
          totalBoxes,
          totalUnits,
          soldUnits,
          availableUnits,
          soldPercentage: totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wholesale stats',
        error: (error as Error).message
      });
    }
  };
}

export const wholesaleController = new WholesaleController();
