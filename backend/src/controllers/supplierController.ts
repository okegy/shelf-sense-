import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Supplier } from '../types';

interface SupplierData {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  rating: number;
  totalOrders: number;
  reliability: 'High' | 'Medium' | 'Low';
  createdAt: Date;
  updatedAt: Date;
}

class SupplierController {
  private suppliers: SupplierData[] = [
    {
      id: 'sup-001',
      name: 'Fresh Farm Supplies',
      contact: '+91 98765 43210',
      email: 'orders@freshfarm.com',
      address: '123 Agriculture Hub, Mumbai',
      rating: 4.8,
      totalOrders: 156,
      reliability: 'High',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'sup-002',
      name: 'Dairy Direct Ltd',
      contact: '+91 87654 32109',
      email: 'supply@dairydirect.com',
      address: '456 Milk Valley, Pune',
      rating: 4.5,
      totalOrders: 89,
      reliability: 'High',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: 'sup-003',
      name: 'Packaged Foods Co',
      contact: '+91 76543 21098',
      email: 'orders@packagedfoods.com',
      address: '789 Industrial Area, Delhi',
      rating: 4.2,
      totalOrders: 234,
      reliability: 'Medium',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-14')
    }
  ];

  getAllSuppliers = (req: Request, res: Response): void => {
    try {
      res.json({
        success: true,
        data: this.suppliers,
        count: this.suppliers.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suppliers',
        error: (error as Error).message
      });
    }
  };

  getSupplierById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const supplier = this.suppliers.find(sup => sup.id === id);

      if (!supplier) {
        res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
        return;
      }

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier',
        error: (error as Error).message
      });
    }
  };

  createSupplier = (req: Request, res: Response): void => {
    try {
      const supplierData: Omit<SupplierData, 'id' | 'createdAt' | 'updatedAt'> = req.body;

      if (!supplierData.name || !supplierData.contact || !supplierData.email) {
        res.status(400).json({
          success: false,
          message: 'Name, contact, and email are required'
        });
        return;
      }

      const newSupplier: SupplierData = {
        id: uuidv4(),
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.suppliers.push(newSupplier);

      res.status(201).json({
        success: true,
        data: newSupplier,
        message: 'Supplier created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create supplier',
        error: (error as Error).message
      });
    }
  };

  updateSupplier = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const updateData: Partial<Omit<SupplierData, 'id' | 'createdAt'>> = req.body;

      const supplierIndex = this.suppliers.findIndex(sup => sup.id === id);

      if (supplierIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
        return;
      }

      this.suppliers[supplierIndex] = {
        ...this.suppliers[supplierIndex],
        ...updateData,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: this.suppliers[supplierIndex],
        message: 'Supplier updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update supplier',
        error: (error as Error).message
      });
    }
  };

  deleteSupplier = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const supplierIndex = this.suppliers.findIndex(sup => sup.id === id);

      if (supplierIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
        return;
      }

      this.suppliers.splice(supplierIndex, 1);

      res.json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete supplier',
        error: (error as Error).message
      });
    }
  };

  getSuppliersByReliability = (req: Request, res: Response): void => {
    try {
      const { reliability } = req.params;
      const filteredSuppliers = this.suppliers.filter(sup =>
        sup.reliability.toLowerCase() === reliability.toLowerCase()
      );

      res.json({
        success: true,
        data: filteredSuppliers,
        count: filteredSuppliers.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suppliers by reliability',
        error: (error as Error).message
      });
    }
  };

  getTopRatedSuppliers = (req: Request, res: Response): void => {
    try {
      const topRated = this.suppliers
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);

      res.json({
        success: true,
        data: topRated,
        count: topRated.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top rated suppliers',
        error: (error as Error).message
      });
    }
  };

  getSupplierStats = (req: Request, res: Response): void => {
    try {
      const totalSuppliers = this.suppliers.length;
      const averageRating = this.suppliers.reduce((sum, sup) => sum + sup.rating, 0) / totalSuppliers;
      const reliabilityCounts = {
        High: this.suppliers.filter(sup => sup.reliability === 'High').length,
        Medium: this.suppliers.filter(sup => sup.reliability === 'Medium').length,
        Low: this.suppliers.filter(sup => sup.reliability === 'Low').length
      };
      const totalOrders = this.suppliers.reduce((sum, sup) => sum + sup.totalOrders, 0);

      res.json({
        success: true,
        data: {
          totalSuppliers,
          averageRating: Math.round(averageRating * 10) / 10,
          reliabilityCounts,
          totalOrders
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier stats',
        error: (error as Error).message
      });
    }
  };
}

export const supplierController = new SupplierController();
