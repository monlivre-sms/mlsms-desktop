
export function isValidEmail(email) {
    return !!`${email}`.match(/(.*)@(.+)\.([a-z]{2,})/i);
}

export function isValidPassword(password) {
    return !!`${password}`.match(/.{2,}/i);
}
