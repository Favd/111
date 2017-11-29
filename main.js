var dgram = require('dgram');
var socket = dgram.createSocket('udp4')

var devices = [];
var constOptions = {
  port: 10000,
  broadcastIP: "255.255.255.255",
  macPadding: "202020202020",
  magicWord: "6864",
  onoffID: '6463',
  on: '0000000001',
  off: '0000000000',
  seachID: '7161',
  subscribeID: '636c',
  learnID: '6c73',
  learn: '010000000000'
}


function Orvibo(args){
	this.name = '';
	this.ip = args.ip;
	this.macreverse = args.macreverse;
	this.mac = args.mac;
	this.learningMode = 0;
	console.log('object bild - Orvibo');
}
// вытаскивание ip и mac из сообщения
function messageToArguments(msg, info){
	//msg = msg.toString('hex');
	var mac = msg.substr(14,12);
	mcr = mac.split('');
	mcr = mcr[10] + mcr[11] + mcr[8] + mcr[9] + mcr[6] + mcr[7] + mcr[4] + mcr[5] + mcr[2] + mcr[3] + mcr[0] + mcr[1];
	var args = {
		ip: info.adress,
		mac: msg.substr(14,12),
		macreverse: mcr
	}
	return args;
}


//TEMP *********************** !!!!! **************************
var tempMsg ='6864002A716100ACCF232419CX202020202020C0192423CFAC202020202020534f4330303228CA';
var info ={adress: '192.168.0.2'};
var devices = [{ip: '192.168.0.23', mac:'ugu5guu'},{ip: '192.168.0.155', mac:'ugu5ghuu'}];
//TEMP

//ПОИСК УСТРОЙСТВ и создание ОБЪЕКТОВ
function creatdevice(){
//Отправляем запрос на 
//socket.send
// Получаем сообщение, разбираем его, проверяем на "есть ли уже", создаем объект в массиве объектов
	var args = messageToArguments(tempMsg, info);
	var xxx=0;
	for(var i=0; i<devices.length; i++){
		if(args.ip == devices[i].ip) xxx = 1;
	}
	if (xxx==0) {
		devices[devices.length] = new Orvibo(args);
		console.log('object bild - creatdevice');
	}
}

// ИМЕНЕНИЕ СТАТУСА s20
Orvibo.prototype.setStateS20 = function (state){
	if(state == 1){
		var paket = constOptions.magicWord + '0000' + constOptions.onoffID + this.mac + constOptions.macPadding + constOptions.on;
		var length_  = prepareLength(paket); 
		paket = constOptions.magicWord + length_ + constOptions.onoffID + this.mac + constOptions.macPadding + constOptions.on;
		this.sendMessage(paket);		
	} else if(state == 0){
		var paket = constOptions.magicWord + '0000' + constOptions.onoffID + this.mac + constOptions.macPadding + constOptions.off;
		var length_  = prepareLength(paket); 
		paket = constOptions.magicWord + length_ + constOptions.onoffID + this.mac + constOptions.macPadding + constOptions.off;
		this.sendMessage(paket);		
	}
}

// ПОДПИСКА
Orvibo.prototype.subScribe = function (){
	// создаем пакет, узнаем длинну, дописываем 00, создаем финальный пакет с фактичекой длинной
	var paket = constOptions.magicWord + '0000' + constOptions.subscribeID + this.mac + constOptions.macPadding + this.macreverse + constOptions.macPadding;
	var length_  = prepareLength(paket); 
	paket = constOptions.magicWord + length_ + constOptions.subscribeID + this.mac + constOptions.macPadding + this.macreverse + constOptions.macPadding;
	this.sendMessage(paket);
}

// Вход в режим обучения
Orvibo.prototype.learnIR = function (){
	var paket = constOptions.magicWord + '0000' + constOptions.learnID + this.mac + constOptions.macPadding + constOptions.learn;
	var length_  = prepareLength(paket); 
	paket = constOptions.magicWord + length_ + constOptions.learnID + this.mac + constOptions.macPadding + constOptions.learn;
	this.sendMessage(paket);
}

// создание строчки - длинна пакета для отправки
function prepareLength(paket){
	if((paket.length/2).toString(16).length == 1){
		var length_ = '000' + (paket.length/2).toString(16);
	}else if((paket.length/2).toString(16).length == 2){
		length_ = length_ = '00' + (paket.length/2).toString(16);
	}else if((paket.length/2).toString(16).length == 3){
		length_ = length_ = '0' + (paket.length/2).toString(16);
	}
	return length_;
}

// ОТПРАВКА СООБЩЕНИЯ
Orvibo.prototype.sendMessage = function(paket){
	console.log('send message: ' + paket);
}

//TEMP *********************** !!!!! **************************
creatdevice()
console.log('devices[3].ip = ' + devices[2].ip);
devices[2].setStateS20(0);
devices[2].setStateS20(1);
devices[2].subScribe()
devices[2].learnIR();
//TEMP


//686400176463accf23654e362020202020200000000001