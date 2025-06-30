export interface LightspeedItem {
  itemID: string;
  description: string;
  price: number;
  image: string;
  category: string;
  manufacturer?: string;
  upc?: string;
  zip?: string;
}

export const mockLightspeedItems: LightspeedItem[] = [
  {
    itemID: 'LS-1',
    description: 'Santa Cruz Hightower Carbon S Kit',
    price: 120,
    image: 'https://images.squarespace-cdn.com/content/v1/54ed5347e4b0baa5b2214761/1598647769839-1S0QC0BYG10G1SNEJHGE/Santa+Cruz+Hightower+Carbon+S+kit+rental+demo+bike?format=2500w',
    category: 'mountain-bikes',
    manufacturer: 'Santa Cruz',
    upc: '111111',
    zip: '89541',
  },
  {
    itemID: 'LS-2',
    description: '2020 Specialized Stumpjumper 27.5" 29"',
    price: 110,
    image: 'https://images.squarespace-cdn.com/content/v1/54ed5347e4b0baa5b2214761/1572545263294-YK2I0B6KA8CRWWL5HF8K/2020+Specialized+Stumpjumper+27.5%22+29%22mountain+bike+demo%2Frental+Fairfax+Marin?format=2500w',
    category: 'mountain-bikes',
    manufacturer: 'Specialized',
    upc: '222222',
    zip: '89541',
  },
  {
    itemID: 'LS-3',
    description: 'Yeti SB130 Turq Series',
    price: 130,
    image: 'https://images.squarespace-cdn.com/content/v1/54ed5347e4b0baa5b2214761/5dcc5ca5-1d98-486f-9938-c23e8c7655e5/Screen+Shot+2022-02-25+at+3.22.11+PM.png?format=2500w',
    category: 'mountain-bikes',
    manufacturer: 'Yeti',
    upc: '333333',
    zip: '89541',
  },
];
