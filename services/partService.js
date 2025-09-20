import Part from '../models/Part.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

class PartService {
    async createPart(data) {
        const { name, type, parts } = data;

        if (type === 'ASSEMBLED') {
            await this.checkCircularDependency(parts, name);
        }

        const part = await Part.create({
            name,
            type,
            parts: type === 'ASSEMBLED' ? parts : null,
        });

        return part;
    }

    async checkCircularDependency(subParts, parentName, visited = new Set()) {
        const subPartIds = subParts.map(sub => sub.id);
        if (subPartIds.some(id => visited.has(id))) {
            throw new Error(`Circular dependency detected`);
        }

        const parts = await Part.findAll({ where: { id: { [Op.in]: subPartIds } } });
        const partMap = new Map(parts.map(p => [p.id, p]));

        for (const sub of subParts) {
            visited.add(sub.id);
            const part = partMap.get(sub.id);
            if (!part) {
                throw new Error(`Sub-part not found: ${sub.id}`);
            }
            if (part && part.parts && part.type === 'ASSEMBLED') {
                await this.checkCircularDependency(part.parts, parentName, visited);
            }
            visited.delete(sub.id);
        }
    }

    async addToInventory(partId, quantity) {
        return sequelize.transaction(async (t) => {
            const part = await Part.findByPk(partId, { transaction: t });
            if (!part) throw new Error('Part not found');

            if (part.type === 'RAW') {
                part.quantity += quantity;
                await part.save({ transaction: t });
            } else {
                await this.checkAndDeductSubParts(part, quantity, t);
                part.quantity += quantity;
                await part.save({ transaction: t });
            }
        });
    }

    async checkAndDeductSubParts(part, multiplier, transaction) {
        const subPartIds = part.parts.map(sub => sub.id);
        const subPartsInDb = await Part.findAll({ where: { id: { [Op.in]: subPartIds } }, transaction });
        const subPartMap = new Map(subPartsInDb.map(p => [p.id, p]));

        for (const sub of part.parts) {
            const subPart = subPartMap.get(sub.id);
            if (!subPart) throw new Error(`Sub-part not found: ${sub.id}`);
            if (subPart.quantity < sub.quantity * multiplier) {
                throw new Error(`Insufficient quantity for ${sub.id}`);
            }
        }

        for (const sub of part.parts) {
            const subPart = subPartMap.get(sub.id);
            if (subPart.type === 'ASSEMBLED') {
                await this.checkAndDeductSubParts(subPart, sub.quantity * multiplier, transaction);
            }
            subPart.quantity -= sub.quantity * multiplier;
            await subPart.save({ transaction });
        }
    }

    async getAllParts() {
        return Part.findAll();
    }
}

export default new PartService();
