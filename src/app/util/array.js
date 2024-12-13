export function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

export function unique(array) {
    return array.filter((value, index, self) => self.indexOf(value) === index);
}
