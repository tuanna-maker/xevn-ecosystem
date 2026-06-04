import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Supabase `candidates` table (distinct from recruitment_candidates). */
export class ListCandidatesTableQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  stage?: string;
}
