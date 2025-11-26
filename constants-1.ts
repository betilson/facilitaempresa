

import { ATM, ATMStatus, BankName, Product, Plan, PlanType, Bank } from './types';

// Array vazio - Bancos serão adicionados manualmente pelos usuários
export const BANKS: Bank[] = [];

export const MOCK_ATMS: ATM[] = [
  {
    id: '1',
    name: 'ATM Vila Alice',
    bank: BankName.BAI,
    address: 'Rua Aníbal de Melo, Vila Alice',
    status: ATMStatus.HAS_MONEY,
    distance: '0.2 km',
    lat: 40,
    lng: 40,
    lastUpdated: '10 min atrás',
    votes: 124
  },
  {
    id: '2',
    name: 'ATM Largo da Família',
    bank: BankName.BFA,
    address: 'Largo da Família, Luanda',
    status: ATMStatus.OFFLINE,
    distance: '0.5 km',
    lat: 60,
    lng: 20,
    lastUpdated: '1 hora atrás',
    votes: 5
  },
  {
    id: '3',
    name: 'ATM Mutamba',
    bank: BankName.BIC,
    address: 'Rua da Missão',
    status: ATMStatus.HAS_MONEY,
    distance: '1.2 km',
    lat: 20,
    lng: 70,
    lastUpdated: '2 min atrás',
    votes: 450
  },
  {
    id: '4',
    name: 'ATM Atlantico Shopping',
    bank: BankName.ATL,
    address: 'Belas Shopping',
    status: ATMStatus.NO_MONEY,
    distance: '3.5 km',
    lat: 80,
    lng: 80,
    lastUpdated: '30 min atrás',
    votes: 12
  },
  {
    id: '5',
    name: 'ATM Banco Sol',
    bank: BankName.SOL,
    address: 'Av. Ho Chi Minh',
    status: ATMStatus.HAS_MONEY,
    distance: '0.8 km',
    lat: 50,
    lng: 50,
    lastUpdated: '5 min atrás',
    votes: 89
  }
];

// Array vazio - Produtos serão adicionados manualmente pelos usuários através da plataforma
export const MOCK_PRODUCTS: Product[] = [];

export const PLANS: Plan[] = [
  {
    id: 'free',
    type: PlanType.FREE,
    price: 0,
    features: ['2 Publicações', '0 Destaques', 'Suporte Básico'],
    color: 'bg-white border-gray-200 text-gray-700',
    maxProducts: 2,
    maxHighlights: 0
  },
  {
    id: 'basic',
    type: PlanType.BASIC,
    price: 2000,
    features: ['30 Publicações', '10 Destaques', 'Suporte Básico'],
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    maxProducts: 30,
    maxHighlights: 10
  },
  {
    id: 'pro',
    type: PlanType.PROFESSIONAL,
    price: 10000,
    features: ['100 Publicações', '50 Destaques', 'Estatísticas Básicas'],
    color: 'bg-yellow-50 border-yellow-400 text-yellow-900', // Gold/Yellow Theme
    maxProducts: 100,
    maxHighlights: 50
  },
  {
    id: 'premium',
    type: PlanType.PREMIUM,
    price: 25000,
    features: ['Publicações Ilimitadas', 'Destaques Ilimitados', 'Suporte VIP', 'Gestor de Conta'],
    color: 'bg-gray-900 border-red-600 text-white', // Black/Red Elite Theme
    maxProducts: -1, // Unlimited
    maxHighlights: -1 // Unlimited
  }
];

export const ANGOLA_PROVINCES = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire"
];

export const ANGOLA_MUNICIPALITIES: Record<string, string[]> = {
  "Bengo": ["Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"],
  "Benguela": ["Baía Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito"],
  "Bié": ["Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Cuíto", "Nharea"],
  "Cabinda": ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
  "Cuando Cubango": ["Calai", "Cuangar", "Cuchi", "Cuito Cuanavale", "Dirico", "Mavinga", "Menongue", "Nancova", "Rivungo"],
  "Cuanza Norte": ["Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Gonguembo", "Lucala", "Quiculungo", "Samba Caju"],
  "Cuanza Sul": ["Amboim", "Cassongue", "Cela", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"],
  "Cunene": ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"],
  "Huambo": ["Bailundo", "Caála", "Catchiungo", "Chicala-Choloanga", "Chinjenje", "Ecunha", "Huambo", "Londuimbali", "Longonjo", "Mungo", "Ucuma"],
  "Huíla": ["Caconda", "Cacula", "Caluquembe", "Chiange", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo"],
  "Luanda": ["Belas", "Cacuaco", "Cazenga", "Ícolo e Bengo", "Luanda", "Quiçama", "Talatona", "Viana", "Kilamba Kiaxi"],
  "Lunda Norte": ["Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuilo", "Lóvua", "Lubalo", "Lucapa", "Xá-Muteba"],
  "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
  "Malanje": ["Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Cuaba Nzogo", "Cunda-Dia-Baza", "Luquembo", "Malanje", "Marimba", "Massango", "Mucari", "Quela", "Quirima"],
  "Moxico": ["Alto Zambeze", "Bundas", "Camanongue", "Léua", "Luacano", "Luau", "Luchazes", "Cameia", "Moxico"],
  "Namibe": ["Bibala", "Camacuio", "Moçâmedes", "Tômbua", "Virei"],
  "Uíge": ["Alto Cauale", "Ambuíla", "Bembe", "Buengas", "Bungo", "Damba", "Maquela do Zombo", "Milunga", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Songo", "Uíge"],
  "Zaire": ["Cuimba", "M'Banza Kongo", "Noqui", "N'Zeto", "Soyo", "Tomboco"]
};