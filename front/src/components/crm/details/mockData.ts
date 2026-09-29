export interface MockActivity {
  id: string;
  type: "appel" | "email" | "whatsapp" | "rdv" | "note";
  label: string;
  description?: string;
  scheduledAt: string;
  completedAt?: string;
  status: "terminee" | "en_cours" | "planifiee" | "en_retard";
  delayMinutes?: number;
}

export interface MockOpportunity {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentActivity: MockActivity;
  historyActivities: MockActivity[];
}

export interface MockProspectDetail {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  ville: string;
  source: string;
  tags: string[];
  statut: "prospect" | "user" | "compte_pro";
  isActif: boolean;
  createdAt: string;

  stats: {
    annonces: number;
    publications: number;
    favoris: number;
    followers: number;
    caGenere: number;
    depensesAds: number;
  };

  pro: {
    typeCompte: string;
    nomEntreprise: string;
    secteur: string;
    taille: string;
    role: string;
    siteWeb: string;
    ca: string;
  };

  note: {
    texte: string;
    modifiedBy: string;
    modifiedAt: string;
  };

  opportunity: MockOpportunity;
}

export const MOCK_PROSPECT: MockProspectDetail = {
  id: 1042,
  nom: "Tali",
  prenom: "Youssef",
  telephone: "+212 6 61 23 45 67",
  email: "youssef.tali@gmail.com",
  ville: "Casablanca",
  source: "Facebook",
  tags: ["Automobile", "VIP", "Relance"],
  statut: "prospect",
  isActif: true,
  createdAt: "2025-03-12T09:30:00Z",

  stats: {
    annonces: 0,
    publications: 0,
    favoris: 0,
    followers: 0,
    caGenere: 0,
    depensesAds: 0,
  },

  pro: {
    typeCompte: "Prospect",
    nomEntreprise: "Auto Prestige Maroc",
    secteur: "Automobile",
    taille: "10–50 employés",
    role: "Directeur commercial",
    siteWeb: "autoprestige.ma",
    ca: "1,2 M DH / an",
  },

  note: {
    texte:
      "Client très intéressé par le compte Pro Automobile. A demandé un devis détaillé pour le pack Annonces Premium. Préfère être contacté en matinée. Relancer après le 15 du mois.",
    modifiedBy: "Driss Bakhtaoui",
    modifiedAt: "2025-08-18T10:20:00Z",
  },

  opportunity: {
    id: "OPP-2024-0312",
    name: "Youssef Tali",
    type: "Compte Pro",
    amount: 3500,
    currentActivity: {
      id: "act-001",
      type: "appel",
      label: "Appel de suivi",
      description: "Relancer le prospect pour validation du devis Pro.",
      scheduledAt: "2025-08-22T10:00:00Z",
      status: "en_retard",
      delayMinutes: 47,
    },
    historyActivities: [
      {
        id: "act-004",
        type: "rdv",
        label: "RDV Présentation Pro",
        description: "Présentation des offres Pro Automobile.",
        scheduledAt: "2025-08-15T14:30:00Z",
        completedAt: "2025-08-15T15:10:00Z",
        status: "terminee",
      },
      {
        id: "act-003",
        type: "email",
        label: "Email devis envoyé",
        description: "Devis Pack Annonces Premium envoyé par email.",
        scheduledAt: "2025-08-10T11:00:00Z",
        completedAt: "2025-08-10T11:03:00Z",
        status: "terminee",
      },
      {
        id: "act-002",
        type: "whatsapp",
        label: "Message WhatsApp",
        description: "Premier contact — présentation de la plateforme.",
        scheduledAt: "2025-08-05T09:15:00Z",
        completedAt: "2025-08-05T09:20:00Z",
        status: "terminee",
      },
    ],
  },
};
