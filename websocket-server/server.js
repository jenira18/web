const WebSocket = require('ws');

// สร้างเซิร์ฟเวอร์ WebSocket ที่ทำงานบนพอร์ต 8080
const wss = new WebSocket.Server({ port: 8080 });

let currentSeats = 8; // จำนวนที่นั่งว่าง
const checkInHistory = []; // เก็บประวัติการเช็คอิน

// ฟังก์ชันส่งข้อมูลไปยังทุกไคลเอนต์ที่เชื่อมต่ออยู่
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// เมื่อมีการเชื่อมต่อเข้ามา
wss.on('connection', (ws) => {
    console.log('มีผู้ใช้เชื่อมต่อ');
    
    // ส่งข้อมูลสถานะปัจจุบันไปยังผู้ใช้ใหม่ที่เชื่อมต่อเข้ามา
    ws.send(JSON.stringify({
        currentSeats: currentSeats,
        checkInHistory: checkInHistory
    }));

    // ฟังการส่งข้อความจากไคลเอนต์
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'checkIn') {
            if (currentSeats > 0) {
                currentSeats--;
                checkInHistory.push({ userId: data.userId, time: data.time });
                broadcast({
                    currentSeats: currentSeats,
                    checkInHistory: checkInHistory
                });
                console.log(`${data.userId} เช็คอินเวลา ${data.time}`);
            } else {
                ws.send(JSON.stringify({ error: 'รถเต็มแล้ว!' }));
            }
        } else if (data.type === 'checkOut') {
            currentSeats++;
            broadcast({
                currentSeats: currentSeats,
                checkInHistory: checkInHistory
            });
            console.log(`${data.userId} ลงรถเวลา ${data.time}`);
        }
    }