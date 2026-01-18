import { Request, Response } from 'express';
import { Member } from '../models/Member.js';

// Get all members
export const getAllMembers = async (req: Request, res: Response) => {
    try {
        const members = await Member.find().sort({ createdAt: 1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching members', error });
    }
};

// Get single member
export const getMember = async (req: Request, res: Response) => {
    try {
        const member = await Member.findOne({ id: req.params.id });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching member', error });
    }
};

// Create new member
export const createMember = async (req: Request, res: Response) => {
    try {
        const member = new Member(req.body);
        const savedMember = await member.save();
        res.status(201).json(savedMember);
    } catch (error) {
        res.status(400).json({ message: 'Error creating member', error });
    }
};

// Update member
export const updateMember = async (req: Request, res: Response) => {
    try {
        const member = await Member.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        res.status(400).json({ message: 'Error updating member', error });
    }
};

// Delete member
export const deleteMember = async (req: Request, res: Response) => {
    try {
        const member = await Member.findOneAndDelete({ id: req.params.id });
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting member', error });
    }
};
