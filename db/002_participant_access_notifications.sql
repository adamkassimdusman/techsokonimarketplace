-- Accepted buyers retain access to the reserved device, without exposing it publicly.
CREATE POLICY listing_reserved_buyer ON listings FOR SELECT USING (
 status='reserved' AND EXISTS (
  SELECT 1 FROM conversations c JOIN offers o ON o.conversation_id=c.id
  WHERE c.listing_id=listings.id AND c.buyer_id=app_user() AND o.status='accepted'
 )
);
CREATE FUNCTION notify_new_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 INSERT INTO public.notifications(user_id,body)
 SELECT CASE WHEN NEW.sender_id=c.buyer_id THEN c.seller_id ELSE c.buyer_id END,
 'You have a new laptop enquiry message. Open Messages to reply.'
 FROM public.conversations c WHERE c.id=NEW.conversation_id;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION notify_new_message() FROM PUBLIC;
CREATE TRIGGER message_notification AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION notify_new_message();
CREATE FUNCTION notify_inspection_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
 INSERT INTO public.notifications(user_id,body) VALUES(NEW.requester_id,'Inspection appointment status: '||NEW.status||'. Check your dashboard for details.');
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION notify_inspection_status() FROM PUBLIC;
CREATE TRIGGER inspection_notification AFTER INSERT OR UPDATE OF status ON inspections FOR EACH ROW EXECUTE FUNCTION notify_inspection_status();
INSERT INTO migrations VALUES(2);
