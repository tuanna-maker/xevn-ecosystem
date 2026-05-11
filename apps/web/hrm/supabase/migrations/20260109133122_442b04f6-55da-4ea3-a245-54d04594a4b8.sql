-- Create storage bucket for candidate avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-avatars', 'candidate-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for candidate avatars bucket
CREATE POLICY "Anyone can view candidate avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'candidate-avatars');

CREATE POLICY "Authenticated users can upload candidate avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'candidate-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update candidate avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'candidate-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete candidate avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'candidate-avatars' AND auth.role() = 'authenticated');

-- Create candidates table to store candidate data including avatar URLs
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  stage TEXT DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'offer', 'hired')),
  applied_date DATE DEFAULT CURRENT_DATE,
  source TEXT,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  notes TEXT,
  avatar_url TEXT,
  nationality TEXT DEFAULT 'Việt Nam',
  height TEXT,
  weight TEXT,
  ethnicity TEXT DEFAULT 'Kinh',
  religion TEXT,
  expected_start_date DATE,
  military_service TEXT,
  marital_status TEXT,
  hometown TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on candidates table
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- RLS policies for candidates - public read for now (can be restricted later)
CREATE POLICY "Anyone can view candidates"
ON public.candidates FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert candidates"
ON public.candidates FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update candidates"
ON public.candidates FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete candidates"
ON public.candidates FOR DELETE
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();