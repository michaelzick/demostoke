-- Create trigger to automatically create design system profiles for new users
CREATE TRIGGER on_auth_design_system_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_design_system_user();;
