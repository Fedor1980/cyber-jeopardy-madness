import { Request, Response } from 'express';
import { LeaderboardService } from '../services/LeaderboardService';
import { SuccessResponse } from '../types';

export class LeaderboardController {
  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(req: Request, res: Response): Promise<void> {
    const { industryPack, limit, offset } = req.query;

    const leaderboard = await LeaderboardService.getGlobalLeaderboard({
      industryPack: industryPack as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    const response: SuccessResponse<typeof leaderboard> = {
      success: true,
      data: leaderboard,
    };

    res.status(200).json(response);
  }

  /**
   * Get session leaderboard
   */
  static async getSessionLeaderboard(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    const leaderboard = await LeaderboardService.getSessionLeaderboard(sessionId);

    const response: SuccessResponse<typeof leaderboard> = {
      success: true,
      data: leaderboard,
    };

    res.status(200).json(response);
  }

  /**
   * Get team statistics
   */
  static async getTeamStats(req: Request, res: Response): Promise<void> {
    const { teamId } = req.params;

    const stats = await LeaderboardService.getTeamStats(teamId);

    const response: SuccessResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  }

  /**
   * Get industry pack statistics
   */
  static async getIndustryPackStats(req: Request, res: Response): Promise<void> {
    const { industryPack } = req.params;

    const stats = await LeaderboardService.getIndustryPackStats(industryPack);

    const response: SuccessResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.status(200).json(response);
  }
}
