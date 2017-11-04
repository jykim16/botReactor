


let itemB = {
  'body care': 'B',
  'shampoo': 'B01',
  'conditional': 'B02',
  'body wash': 'B03',
  'body lotion': 'B04',
}

let itemC = {
  'clothings': 'C',
  'shirt': 'C01',
  'jean': 'C02',
  'socks': 'C03',
  'hoddie': 'C04',
}

let itemE = {
  'electronics': 'E',
  'tv': 'E01',
  'speaker': 'E02',
  'computer': 'E03',
  'smart phone': 'E04',
}

let itemP = {
  'pet care': 'P',
  'cat food': 'P01',
  'bird food': 'P02',
  'dog food': 'P03',
  'fish food': 'P04',
}

let itemH = {
  'home improvment': 'H',
  'dish': 'H01',
  'cup': 'H02',
  'pan': 'H03',
  'knife': 'H04',
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
