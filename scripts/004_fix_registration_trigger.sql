-- Improved function to update event participant count
CREATE OR REPLACE FUNCTION public.update_event_participant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only count if status is 'registered'
    IF NEW.status = 'registered' THEN
      UPDATE public.events 
      SET current_participants = (
        SELECT COUNT(*) 
        FROM public.event_registrations 
        WHERE event_id = NEW.event_id AND status = 'registered'
      )
      WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      UPDATE public.events 
      SET current_participants = (
        SELECT COUNT(*) 
        FROM public.event_registrations 
        WHERE event_id = NEW.event_id AND status = 'registered'
      )
      WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events 
    SET current_participants = (
      SELECT COUNT(*) 
      FROM public.event_registrations 
      WHERE event_id = OLD.event_id AND status = 'registered'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Update trigger to handle INSERT, UPDATE, and DELETE
DROP TRIGGER IF EXISTS update_participant_count ON public.event_registrations;
CREATE TRIGGER update_participant_count
  AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_event_participant_count();

-- Update all existing events to have correct participant counts
UPDATE public.events 
SET current_participants = (
  SELECT COUNT(*) 
  FROM public.event_registrations 
  WHERE event_registrations.event_id = events.id 
  AND event_registrations.status = 'registered'
);
