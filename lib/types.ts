export type Session = {
  id: string;
  title: string;
  date_time: string;
  location: string;
  notes: string | null;
  created_at: string;
  signups?: Signup[];
};

export type Signup = {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  created_at: string;
};
