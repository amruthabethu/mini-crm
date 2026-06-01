export interface IHistoryLog {
  id: string;
  note: string;
  status: string;
  followUpDate: string;
  createdAt: string;
}

export interface ILead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: "New" | "Contacted" | "Follow Up" | "Converted" | "Lost";
  notes: string;
  followUpDate: string;
  createdAt: string;
  history: IHistoryLog[];
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface IDashboardStats {
  total: number;
  newLeads: number;
  contacted: number;
  followUp: number;
  converted: number;
  lost: number;
  bySource: {
    name: string;
    value: number;
  }[];
  byDate: {
    date: string;
    count: number;
  }[];
}
