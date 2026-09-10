export interface AuthUserType {
  user_id: number;
  user_email: string;
  user_name: string;
  user_profile_image: string | null;
  user_profile_name: string;
  iat: number;
  exp: number;
}
