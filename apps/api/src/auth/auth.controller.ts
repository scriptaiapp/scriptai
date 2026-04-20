import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { forgotPasswordSchema, resetPasswordSchema, verifyOtpSchema } from '@repo/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { z } from 'zod';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: { email: { type: 'string', format: 'email' } },
    },
  })
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    body: z.infer<typeof forgotPasswordSchema>,
  ) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP sent to email' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'otp'],
      properties: {
        email: { type: 'string', format: 'email' },
        otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
      },
    },
  })
  async verifyOtp(
    @Body(new ZodValidationPipe(verifyOtpSchema))
    body: z.infer<typeof verifyOtpSchema>,
  ) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set new password after OTP verification' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'otp', 'newPassword', 'confirmNewPassword'],
      properties: {
        email: { type: 'string', format: 'email' },
        otp: { type: 'string', pattern: '^\\d{6}$' },
        newPassword: { type: 'string', minLength: 8, maxLength: 32 },
        confirmNewPassword: { type: 'string' },
      },
    },
  })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema))
    body: z.infer<typeof resetPasswordSchema>,
  ) {
    return this.authService.resetPassword(body.email, body.otp, body.newPassword, body.confirmNewPassword);
  }
}