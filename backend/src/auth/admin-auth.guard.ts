import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';