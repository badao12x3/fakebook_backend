function isValidName(username){
    // https://stackoverflow.com/questions/12018245/regular-expression-to-validate-username
    const regName = /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
    const regPhone = /^0\d{9}$/;

    if( !regName.test(username)){
        return false;
    }
    if( regPhone.test(username)){
        return false;
    }
    return true;
}

function isValidPassword(password){
    // được phép là chữ, số, gạch dưới, độ dài từ 6 -> 30 kí tự
    const regChar = /^[\w_]{6,30}$/;
    // số điện thoại
    const regPhone = /^0\d{9}$/;
    if( !regChar.test(password)){
        return false;
    }
    if(regPhone.test(password)){
        return false;
    }
    return true;
}

function isNumber(num){
    const regNum = /^-?\d+$/;
    return regNum.test(num);
}

function isValidId(id){
    const regId = /^[0-9a-fA-F]{24}$/;
    return regId.test(id);
}

function isPhoneNumber(number){
    const regPhone = /^0\d{9}$/;
    return regPhone.test(number);
}

module.exports = {
    isValidName,
    isValidPassword,
    isPhoneNumber,
    isValidId,
    isNumber
}