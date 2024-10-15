const WebSocket = require('ws');

// สร้างเซิร์ฟเวอร์ WebSocket ที่ทำงานบนพอร์ต 8080
const wss = new WebSocket.Server({ port: 8080 });

let currentSeats = 8; // จำนวนที่นั่งว่าง
const checkInHistory = []; // เก็บประวัติการเช็คอิน

// เมื่อมีการเชื่อมต่อเข้ามา
wss.on('connection', (ws) => {
    console.log('มีผู้ใช้เชื่อมต่อ');

    // ฟังการส่งข้อความจากไคลเอนต์
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'checkIn') {
            if (currentSeats > 0) {
                currentSeats--; // ลดจำนวนที่นั่งว่าง
                checkInHistory.push({ userId: data.userId, time: data.time });
                // ส่งข้อมูลกลับไปยังไคลเอนต์
                ws.send(JSON.stringify({
                    currentSeats: currentSeats,
                    checkInHistory: checkInHistory
                }));
                console.log(`${data.userId} เช็คอินเวลา ${data.time}`);
            } else {
                ws.send(JSON.stringify({ error: 'รถเต็มแล้ว!' }));
            }
        } else if (data.type === 'checkOut') {
            currentSeats++; // เพิ่มจำนวนที่นั่งว่าง
            ws.send(JSON.stringify({
                currentSeats: currentSeats,
                checkInHistory: checkInHistory
            }));
            console.log(`${data.userId} ลงรถเวลา ${data.time}`);
        }
    });

    // เมื่อมีผู้ใช้ปิดการเชื่อมต่อ
    ws.on('close', () => {
        console.log('ผู้ใช้ปิดการเชื่อมต่อ');
    });
});

// แสดงข้อความเมื่อเซิร์ฟเวอร์ทำงาน
console.log('WebSocket เซิร์ฟเวอร์ทำงานที่ ws://localhost:8080');

