


let itemB = {
  'body care': 'B',
  'shampoo': 'B01',
  'conditioner': 'B02',
  'body wash': 'B03',
  'body lotion': 'B04',
}

let itemC = {
  'clothes': 'C',
  'clothing': 'C',
  'shirt': 'C01',
  'jeans': 'C02',
  'socks': 'C03',
  'shoes': 'CO3',
  'hoodie': 'C04',
}

let itemE = {
  'electronics': 'E',
  'tv': 'E01',
  'speakers': 'E02',
  'computer': 'E03',
  'cellphone': 'E04',
}

let itemP = {
  'pet care': 'P',
  'cat litter': 'P01',
  'bird food': 'P02',
  'dog food': 'P03',
  'fish food': 'P04',
}

let itemK = {
  'kitchen': 'K',
  'dish': 'H01',
  'cup': 'H02',
  'pan': 'H03',
  'knives': 'H04',
}

let itemG = {
  'grocery': 'G',
  'milk': 'G01',
  'fruit': 'G02',
  'frozen food': 'G03',
  'bread': 'G04',
}


let allItems = Object.assign(
  itemB,
  itemC,
  itemE,
  itemP,
  itemH,
  itemG);

module.exports = allItems;

// console.log(allItems);
