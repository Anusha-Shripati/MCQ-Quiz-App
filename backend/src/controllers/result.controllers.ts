import { Request, Response, NextFunction } from 'express';
import { generateResponse } from '../utils/generateResponse';
import { ResultService } from '../services/result.services';
const resultService = new ResultService();

export class ResultController {
    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const resultData = await resultService.get(id);
            return generateResponse(res, 200, resultData, true, 'Result fetched successfully');
        } catch (error) {
            next(error);
        }
    };
}
