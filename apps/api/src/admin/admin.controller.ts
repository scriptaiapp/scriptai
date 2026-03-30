import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import type { AuthRequest } from '../common/interfaces/auth-request.interface';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private getUserId(req: AuthRequest): string {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  // ==================== DASHBOARD ====================

  @Get('stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ==================== USERS ====================

  @Get('users')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getUsers(
      Number(page) || 1,
      Number(limit) || 20,
      search,
      role,
    );
  }

  @Get('users/:userId')
  getUser(@Param('userId') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Put('users/:userId')
  updateUser(
    @Param('userId') userId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthRequest,
  ) {
    this.adminService.logActivity(this.getUserId(req), 'update_user', 'user', userId, body);
    return this.adminService.updateUser(userId, body);
  }

  @Delete('users/:userId')
  deleteUser(@Param('userId') userId: string, @Req() req: AuthRequest) {
    this.adminService.logActivity(this.getUserId(req), 'delete_user', 'user', userId);
    return this.adminService.deleteUser(userId);
  }

  // ==================== SALES REPS ====================

  @Get('sales-reps')
  getSalesReps(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getSalesReps(Number(page) || 1, Number(limit) || 20);
  }

  @Post('sales-reps')
  createSalesRep(
    @Body() body: { email: string; name: string; password: string },
    @Req() req: AuthRequest,
  ) {
    this.adminService.logActivity(this.getUserId(req), 'create_sales_rep', 'sales_rep', undefined, { email: body.email });
    return this.adminService.createSalesRep(body.email, body.name, body.password);
  }

  @Delete('sales-reps/:userId')
  removeSalesRep(@Param('userId') userId: string, @Req() req: AuthRequest) {
    this.adminService.logActivity(this.getUserId(req), 'remove_sales_rep', 'sales_rep', userId);
    return this.adminService.removeSalesRepRole(userId);
  }

  // ==================== BLOGS ====================

  @Get('blogs')
  getBlogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getBlogs(Number(page) || 1, Number(limit) || 20, status);
  }

  @Get('blogs/:id')
  getBlog(@Param('id') id: string) {
    return this.adminService.getBlog(id);
  }

  @Post('blogs')
  createBlog(
    @Body() body: {
      title: string;
      slug: string;
      excerpt?: string;
      content: string;
      cover_image_url?: string;
      category?: string;
      tags?: string[];
      status?: string;
      featured?: boolean;
    },
    @Req() req: AuthRequest,
  ) {
    const userId = this.getUserId(req);
    this.adminService.logActivity(userId, 'create_blog', 'blog', undefined, { title: body.title });
    return this.adminService.createBlog(userId, body);
  }

  @Put('blogs/:id')
  updateBlog(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthRequest,
  ) {
    this.adminService.logActivity(this.getUserId(req), 'update_blog', 'blog', id);
    return this.adminService.updateBlog(id, body);
  }

  @Delete('blogs/:id')
  deleteBlog(@Param('id') id: string, @Req() req: AuthRequest) {
    this.adminService.logActivity(this.getUserId(req), 'delete_blog', 'blog', id);
    return this.adminService.deleteBlog(id);
  }

  // ==================== ACTIVITIES ====================

  @Get('activities')
  getActivities(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.adminService.getActivities(
      Number(page) || 1,
      Number(limit) || 50,
      entityType,
    );
  }

  // ==================== MAILS ====================

  @Get('mails')
  getMails(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getMails(Number(page) || 1, Number(limit) || 20, status);
  }

  @Put('mails/:id')
  updateMailStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: AuthRequest,
  ) {
    return this.adminService.updateMailStatus(id, body.status, this.getUserId(req));
  }

  // ==================== JOB POSTS CRUD ====================

  @Get('jobs')
  getJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getJobPosts(Number(page) || 1, Number(limit) || 20, status);
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    return this.adminService.getJobPost(id);
  }

  @Post('jobs')
  createJob(
    @Body() body: {
      title: string;
      team: string;
      location?: string;
      type?: string;
      description: string;
      requirements?: string;
      status?: string;
    },
    @Req() req: AuthRequest,
  ) {
    this.adminService.logActivity(this.getUserId(req), 'create_job', 'job_post', undefined, { title: body.title });
    return this.adminService.createJobPost(body);
  }

  @Put('jobs/:id')
  updateJob(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthRequest,
  ) {
    this.adminService.logActivity(this.getUserId(req), 'update_job', 'job_post', id);
    return this.adminService.updateJobPost(id, body);
  }

  @Delete('jobs/:id')
  deleteJob(@Param('id') id: string, @Req() req: AuthRequest) {
    this.adminService.logActivity(this.getUserId(req), 'delete_job', 'job_post', id);
    return this.adminService.deleteJobPost(id);
  }

  // ==================== JOB APPLICATIONS ====================

  @Get('applications')
  getApplications(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getApplications(Number(page) || 1, Number(limit) || 20, status);
  }

  @Get('applications/:id')
  getApplication(@Param('id') id: string) {
    return this.adminService.getApplication(id);
  }

  @Put('applications/:id')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
    @Req() req: AuthRequest,
  ) {
    const userId = this.getUserId(req);
    this.adminService.logActivity(userId, 'update_application', 'job_application', id, body);
    return this.adminService.updateApplicationStatus(id, body.status, userId, body.notes);
  }

  @Delete('applications/:id')
  deleteApplication(@Param('id') id: string, @Req() req: AuthRequest) {
    this.adminService.logActivity(this.getUserId(req), 'delete_application', 'job_application', id);
    return this.adminService.deleteApplication(id);
  }

  // ==================== AFFILIATES ====================

  @Get('affiliates/links')
  getAffiliateLinks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllAffiliateLinks(Number(page) || 1, Number(limit) || 20);
  }

  @Get('affiliates/sales')
  getAffiliateSales(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllAffiliateSales(Number(page) || 1, Number(limit) || 20);
  }

  @Put('affiliates/sales/:id')
  updateAffiliateSaleStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Req() req: AuthRequest,
  ) {
    this.adminService.logActivity(this.getUserId(req), 'update_sale_status', 'affiliate_sale', id, body);
    return this.adminService.updateAffiliateSaleStatus(id, body.status);
  }
}
