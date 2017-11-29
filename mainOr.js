var dgram = require('dgram');
var socket = dgram.createSocket('udp4');
socket.bind(10000);

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
  learn: '010000000000',
  sendIRID: '6963',
  sendIR: ''
}


function Orvibo(args){
	this.name = '';
	this.ip = args.ip;
	this.macreverse = args.macreverse;
	this.mac = args.mac;
	this.learningMode = 0;
	console.log('object bild - Orvibo');
	
	process.nextTick(function() {
		socket.on('message',function(msg,info){
			console.log('слушатель с IP' + this.ip);
			console.log('Data received: ' + msg.toString('hex'));
			console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
		});
	
		socket.on('listening',function(){
			var address = socket.address();
			var port = address.port;
			var family = address.family;
			var ipaddr = address.address;
			console.log('Server is listening at port' + port);
			console.log('Server ip :' + ipaddr);
			console.log('Server is IP4/IP6 : ' + family);
			console.log('***********************');
		});
	
		socket.on('error',function(error){
			console.log('Error: ' + error);
			socket.close();
		});
	});
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


//TEMP *********************** !!!!! **************************AC-CF-23-65-4E-36 soket
var tempMsg ='6864002A716100accf23654e36202020202020C0192423CFAC202020202020534f4330303228CA';
var tempMsgAlone ='6864002A716100accf2365c006202020202020C0192423CFAC202020202020534f4330303228CA';
var info ={adress: '192.168.0.150'};
var infoAlone ={adress: '192.168.0.151'};
var devices = [{ip: '192.168.0.23', mac:'ugu5guu'},{ip: '192.168.0.155', mac:'ugu5ghuu'}];
var ircode = 'b80000000000b8000000000000000000a80036238f11410224023d02210240028506410221024002210244021d0243021f0244021d0240028506410285064102220242028206410285064102850641028506410285064102210240022102400221024202830640022102400221024002210240022102400289063d0285064102850641022102440281064102850641028506400287063e02409d4223d2083e02ffffc87801004623cd084102ffffbf7801004623d0083f020000';
//TEMP

//Cоздание ОБЪЕКТОВ
function creatdevice(message, info){
	// Получаем сообщение, разбираем его, проверяем на "есть ли уже", создаем объект в массиве объектов
	var args = messageToArguments(message, info);
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

// ОТПРАВКА IR КОДА
Orvibo.prototype.sendIR = function (codeIR){
	var paket = constOptions.magicWord + '0000' + constOptions.sendIRID + this.mac + constOptions.macPadding + '65000000' + '1214' + codeIR;
	var length_  = prepareLength(paket); 
	paket = constOptions.magicWord + length_ + constOptions.sendIRID + this.mac + constOptions.macPadding + '65000000' + Math.round(Math.random()*10000) + codeIR;
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
	var msg = Buffer.from(paket,'hex');
	socket.send(msg, 10000, this.ip, function(err){
			if(err){
				console.log('error: ' + err);
			}console.log('send message: ' + paket);
		});
}

//TEMP *********************** !!!!! **************************
creatdevice(tempMsg, info);
creatdevice(tempMsgAlone, infoAlone);
console.log('Socket - devices[2].ip = ' + devices[2].ip);
console.log('Alone  - devices[3].ip = ' + devices[3].ip);
console.log('***********************');


process.stdin.resume();
process.stdin.on('data', function(data){
	var x = data.toString('hex');
	
	if(x=='70700d0a'){ //ввод pp - подписка s20
		devices[2].subScribe();
	}else if(x=='7070610d0a'){ //ввод ppa - подписка Alone
		devices[3].subScribe();
	}else if(x=='6f6e0d0a'){ //ввод on
		devices[2].setStateS20(1);
	}else if(x=='6f660d0a'){  //ввод of
		devices[2].setStateS20(0);
	}else if(x=='310d0a' || x==1){  //ввод 1
		socket.close();
	}else if(x=='320d0a' || x==2){  //ввод 2 поиск
		
	}else if(x=='330d0a' || x==3){  //ввод 3 вход в режим обучения
		devices[3].learnIR();
	}else if(x=='340d0a' || x==4){  //ввод 4 вход в режим обучения
		devices[3].sendIR(ircode);
	}
	console.log('You enter: ' + x);
});
//devices[2].subScribe();
//devices[2].setStateS20(0);
//devices[2].setStateS20(1);
//devices[2].subScribe();
//devices[2].learnIR();
//TEMP


//686400176463accf23654e362020202020200000000001