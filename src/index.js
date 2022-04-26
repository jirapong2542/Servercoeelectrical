const express = require('express');
const db = require('./utils/database');
const client = require('./connect/connectmqtt');
const client1 = require('./connect/connectmqttrealtime');

const cors = require('cors');
const jwt = require('jsonwebtoken');

//-----------------------------------------------linetoken------------------------------------------------
const lineNotify = require('line-notify-nodejs')('vdJwKnquR7u9Gw0N3UlOYrgY85annonkAfU3NXo59XM');
//-----------------------------------------------------------------------------------------------------------
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const https = require('https');
const fs = require('fs');
const options = {
    key: fs.readFileSync(__dirname + '/key.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem')
};

let PORT = process.env.PORT || 5000;


///---------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('Hello World v4!');
});

app.post('/login', async (req, res) => {

    const { username, password } = req.body
    try {
        const [result] = await db.execute(`
        SELECT
            usr_id,
            usr_username,
            usr_password,
            usr_fname,
            usr_lname
        FROM
            user
        WHERE
            usr_username = ? AND usr_password = ?`
            , [username, password], (err, result) => {
                if (error) return res.json({ error: error });
            });

        if (result.length === 0) {
            res.status(200).json({ message: 'unauth' });
        } else {
            console.log(result);
            jwt.sign({ usr_id: result[0].usr_id }, 'Teen', (_, token) => {
                res.status(200).json({ message: 'OK', token });
            });
        }

    } catch (err) {
        console.log(err);
    }
});
app.post('/loginadmin', async (req, res) => {

    const { username, password } = req.body
    try {
        const [result] = await db.execute(`
        SELECT
           *
        FROM
            admin
        WHERE
            username = ? AND password = ?`
            , [username, password], (err, result) => {
                if (error) return res.json({ error: error });
            });

        if (result.length === 0) {
            res.status(200).json({ message: 'unauth' });
        } else {
            console.log(result);
            jwt.sign({ usr_id: result[0].usr_id }, 'Teen', (_, token) => {
                res.status(200).json({ message: 'OK', token });
            });
        }

    } catch (err) {
        console.log(err);
    }
})

app.post('/register', (req, res) => {

    const { Username, password, confirm, firstname, lastname } = req.body
    try {

        db.query(` INSERT INTO user (usr_id, usr_username, usr_password, prf_id, usr_fname, usr_lname, created_at, updated_at) VALUES (NULL,?, ?,NULL, ?, ?, ?,?)`,
            [Username, password, firstname, lastname, [new Date()], [new Date()]],
            (err, query) => {
                console.log("err:", err)
                if (err) {
                    return res.status(400).send();
                }

            }
        );
        res.status(200).json({ message: 'สมัครสำเร็จ' });

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }



});

app.post('/macaddress', async (req, res) => {

    const { usr_id } = req.body
    try {
        if (usr_id != "") {

            const [resultmacaddress] = await db.execute(`
        SELECT * FROM
            machine
        WHERE
            usr_id = ? `
                , [usr_id]);
            res.status(200).json(resultmacaddress[0]);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.post('/macaddressdevices', async (req, res) => {

    const { usr_id } = req.body

    try {
        if (usr_id != "") {

            const [resultmacaddress] = await db.execute(`
        SELECT * FROM
            machine
        WHERE
            usr_id = ? `
                , [usr_id]);

            console.log(resultmacaddress)
            res.status(200).json([resultmacaddress]);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.post('/chart', async (req, res) => {

    const { usr_id } = req.body
    try {
        if (usr_id != "") {
            const [resultmacaddress] = await db.execute(`
        SELECT * FROM
            machine
        WHERE
            usr_id = ? `
                , [usr_id]);
            res.status(200).json(resultmacaddress);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.post('/chartdata', async (req, res) => {

    const { macaddress } = req.body

    try {
        if (macaddress != "") {

            const [resultdata] = await db.execute(`
        SELECT * FROM
            data_machine
        WHERE
            m_mac_address  = ? `
                , [macaddress]);


            console.log(resultdata)
            res.status(200).json(resultdata);

        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.post('/edit', async (req, res) => {

    const { Modalm_id, Modalusr_id, ModalName, ModalMacaddress, ModalVoltage, ModalCurrent, ModalPower } = req.body

    try {
        const [result] = await db.execute(`
        UPDATE machine
        SET m_mac_address = ? , m_name = ? , LimitVoltage = ? ,	LimitCurrent = ?,LimitPower = ?
        WHERE
          m_id = ? and usr_id = ? `
            , [ModalMacaddress, ModalName, ModalVoltage, ModalCurrent, ModalPower, Modalm_id, Modalusr_id],
            (error, results) => {
                if (error) return res.json({ error: error });
            }
        );
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }

});


app.post('/delete', async (req, res) => {

    const { m_id, usr_id, Name, Macaddress } = req.body

    try {
        const [result] = await db.execute(`
         DELETE FROM machine
         WHERE m_id = ? and usr_id = ? and m_mac_address = ? and m_name = ?`
            , [m_id, usr_id, Macaddress, Name],
            (error, results) => {
                if (error) return res.json({ error: error });
            }
        );
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }

});

app.post('/addMacAddress', async (req, res) => {

    const { usr_id, addMacAddress } = req.body
    console.log(usr_id, addMacAddress)
    try {
        db.query(` INSERT INTO machine ( usr_id, m_mac_address ,m_name) VALUES (?, ?,?)`,
            [usr_id, addMacAddress, 'PZEM'],
            (error, result) => {
                if (error) {
                    console.log(error)
                    return
                } else {
                    res.status(error).json({ message: 'Not Found' });
                }
            }
        );
        res.status(200).json({ message: 'สมัครสำเร็จ' });
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }


});

app.post('/adminuser', async (req, res) => {

    try {
        const [resultmacaddress] = await db.execute(
            `SELECT * FROM user`
        );
        res.status(200).json(resultmacaddress);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.post('/adminedituser', async (req, res) => {

    const { Modalusr_id, Modalfname, Modallname, ModalUsername, Modalpassword } = req.body
    try {
        const [result] = await db.execute(`
        UPDATE user
        SET usr_username = ? , usr_password = ?,usr_fname = ?,usr_lname = ?
        WHERE
          usr_id = ? `
            , [ModalUsername, Modalpassword, Modalfname, Modallname, Modalusr_id],
            (err, results) => {
                if (err) return res.json({ error: error });
            }
        );
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }

});
app.post('/admindeleteuser', async (req, res) => {

    const { usr_id, usr_username, usr_password } = req.body

    try {
        const [result] = await db.execute(`
         DELETE FROM user
         WHERE usr_id = ? and usr_username = ? and usr_password = ?`
            , [usr_id, usr_username, usr_password],
            (err, results) => {
                if (err) return res.json({ error: error });
            }
        );
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }

});

app.post('/adminmachine', async (req, res) => {

    try {
        const [resultmacaddress] = await db.execute(`
        SELECT * FROM machine INNER JOIN user on machine.usr_id = user.usr_id;`
        );
        res.status(200).json(resultmacaddress);
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

app.post('/admineditmachine', async (req, res) => {

    const { modalm_id, Modalusr_id, ModalMacaddress, Modalname, ModalVoltage, ModalCurrent, ModalPower
    } = req.body

    try {
        const [result] = await db.execute(`
        UPDATE machine
        SET m_mac_address = ? , m_name = ? , LimitVoltage = ? ,	LimitCurrent = ?,LimitPower = ?
        WHERE
          usr_id = ? and m_id=?`
            , [ModalMacaddress, Modalname, ModalVoltage, ModalCurrent, ModalPower, Modalusr_id, modalm_id],
            (error, results) => {
                if (error) return res.json({ error: error });
            }
        );
        res.status(200).json(result);

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }

});
app.post('/admindeletemachine', async (req, res) => {

    const { m_id } = req.body

    try {
        const [result] = await db.execute(`
         DELETE FROM machine
         WHERE m_id = ?`
            , [m_id],
            (error, results) => {
                if (error) return res.json({ error: error });
            }
        );
        res.status(200).json(result);

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }


});

app.post('/adduser', (req, res) => {

    const { Username, password, fname, lname } = req.body
    try {
        if (Username && password && fname && lname == "") {
            console.log("สมัครผิด")
        } else {

            db.query(` INSERT INTO user (usr_id, usr_username, usr_password, prf_id, usr_fname, usr_lname, created_at, updated_at) VALUES (NULL,?, ?,NULL, ?, ?, ?,?)`,
                [Username, password, fname, lname, [new Date()], [new Date()]],
                (err, query) => {
                    console.log("err:", err)
                    if (err) {
                        return res.status(400).send();
                    }

                }
            );
            res.status(200).json({ message: 'สมัครสำเร็จ' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }



});

app.post('/getuser', async (req, res) => {

    const { Username } = req.body
    try {
        if (Username === "") {
            console.log("ไม่มี")
        } else {

            const [result] = await db.execute(`
        SELECT * FROM
            user
        WHERE
            usr_username = ? `
                , [Username]);
            res.status(200).json(result);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }


});
//``````````````````````````````````````````````````````````````````````````````````````````````

//----------------------รับค่า MQTT // และ บันทึกเข้า database---------------------

client.on('message', (topic, message) => {
    // var n = new Date();

    let nDate = new Date().toLocaleString('af-ZA', {
        timeZone: 'Asia/Bangkok'
    });

    // console.log(date.toString());
    // console.log(date.toLocaleString());
    let obj = JSON.parse(message.toString());
    // Voltage

    //console.log(obj.data[0]);
    let m_mac_address = obj.MAC
    console.log(m_mac_address);
    let Voltagep1 = obj.data[0].output[0]
    console.log("Voltagep1:" + Voltagep1)
    let Voltagep2 = obj.data[0].output[1]
    console.log("Voltagep1:" + Voltagep2)
    let Voltagep3 = obj.data[0].output[2]
    console.log("Voltagep1:" + Voltagep3)

    // Current
    console.log(obj.data[1]);
    let Currentp1 = obj.data[1].output[0]
    console.log("Voltagep1:" + Currentp1)
    let Currentp2 = obj.data[1].output[1]
    console.log("Voltagep1:" + Currentp2)
    let Currentp3 = obj.data[1].output[2]
    console.log("Voltagep1:" + Currentp3)

    // Power
    console.log(obj.data[2]);
    let Powerp1 = obj.data[2].output[0]
    console.log("Powerp1:" + Powerp1)
    let Powerp2 = obj.data[2].output[1]
    console.log("Powerp2:" + Powerp2)
    let Powerp3 = obj.data[2].output[2]
    console.log("Powerp3:" + Powerp3)

    // Energy
    console.log(obj.data[3]);
    let Energyp1 = obj.data[3].output[0]
    console.log("Energyp1:" + Energyp1)
    let Energyp2 = obj.data[3].output[1]
    console.log("Energyp2:" + Energyp2)
    let Energyp3 = obj.data[3].output[2]
    console.log("Energyp3:" + Energyp3)

    // Frequency
    console.log(obj.data[4]);
    let Frequencyp1 = obj.data[4].output[0]
    console.log("Frequencyp1:" + Frequencyp1)
    let Frequencyp2 = obj.data[4].output[1]
    console.log("Frequencyp2:" + Frequencyp2)
    let Frequencyp3 = obj.data[4].output[2]
    console.log("Frequencyp3:" + Frequencyp3)


    // Factor
    console.log(obj.data[5]);
    let Factorp1 = obj.data[5].output[0]
    console.log("Factorp1:" + Factorp1)
    let Factorp2 = obj.data[5].output[1]
    console.log("Factorp2:" + Factorp2)
    let Factorp3 = obj.data[5].output[2]
    console.log("Factorp3:" + Factorp3)


    db.query(`INSERT INTO data_machine
     (md_id, m_mac_address, md_volt_p1, md_volt_p2, md_volt_p3, md_current_p1, md_current_p2, md_current_p3, md_power_p1, md_power_p2, md_power_p3, md_energy_p1, md_energy_p2, md_energy_p3, md_frequency_p1, md_frequency_p2, md_frequency_p3, md_factor_p1, md_factor_p2, md_factor_p3, time)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [null, m_mac_address, Voltagep1, Voltagep2, Voltagep3, Currentp1, Currentp2, Currentp3, Powerp1, Powerp2, Powerp3, Energyp1, Energyp2, Energyp3, Frequencyp1, Frequencyp2, Frequencyp3, Factorp1, Factorp2, Factorp3, nDate],
        (error, results) => {
            if (error) return res.json({ error: error });
        }
    );
});

var notifysumVoltage250 = false;
var notifysumVoltage5 = false;
var notifysumVoltagelow = false;

var notifyVoltagepsum = false;
var notifyVoltagepsum1 = false;

var notifysumCurrent = false;

var notifyVoltagep1 = false;
var notifyVoltagep2 = false;
var notifyVoltagep3 = false;

var secondsumVoltage250 = 0;
var secondsumVoltage5 = 0;
var secondsumVoltagelow = 0;

client1.on('message', (topic, message) => {

    //console.log(notifyVoltagepsum)

    let obj = JSON.parse(message.toString());
    // Voltage
    //console.log(obj.data[1]);
    var Voltagep1 = obj.data[0].output[0];
    var Voltagep2 = obj.data[0].output[1];
    var Voltagep3 = obj.data[0].output[2];
    var sumVoltage = (obj.data[0].output[0] + obj.data[0].output[1] + obj.data[0].output[2]) / 3
    var SumCurrent = (obj.data[1].output[0] + obj.data[1].output[1] + obj.data[1].output[2]) / 3
    //console.log(sumVoltage);

    // console.log(Voltagep3);

    if (sumVoltage >= 245) {
        console.log("เข้า>= 245");
        secondsumVoltage250++;
        console.log("sec = " + secondsumVoltage250)
        if (notifysumVoltage250 === false && secondsumVoltage250 >= 4) {
            lineNotify.notify({
                message: '\n' +
                    'ไฟฟ้าทำงานผิดปกติ \n' +
                    'phase 1 : ' + Voltagep1 + '\n' +
                    'phase 2 : ' + Voltagep2 + '\n' +
                    'phase 3 : ' + Voltagep3
            }).then(() => {
                console.log('send completed!');
            });
            notifysumVoltage250 = true;
            console.log(notifysumVoltage250 + "123");
        }
    } else {
        notifysumVoltage250 = false;
        secondsumVoltage250 = 0;
        //console.log("รีค่า250")
    }

    if (sumVoltage <= 5) {
        console.log("เข้า <= 5");
        secondsumVoltage5++;
        console.log("sec<=5 " + secondsumVoltage5);

        if (notifysumVoltage5 === false && secondsumVoltage5 >= 4) {
            lineNotify.notify({
                message: '\n' +
                    'ไฟฟ้าดับ \n' +
                    'phase 1 : ' + Voltagep1 + '\n' +
                    'phase 2 : ' + Voltagep2 + '\n' +
                    'phase 3 : ' + Voltagep3
            }).then(() => {
                console.log('send completed!');
            });
            notifysumVoltage5 = true;
            console.log(notifysumVoltage5 + "123");
        }
    } else {
        notifysumVoltage5 = false;
        secondsumVoltage5 = 0;
        //console.log("รีค่า<=5")
    }

    if (sumVoltage >= 80 && sumVoltage <= 200) {
        secondsumVoltagelow++;
        console.log("เข้า <= ไฟ้าทำงานผิดปกติ");
        console.log("ไฟ้าทำงานผิดปกติ " + secondsumVoltagelow);
        if (notifysumVoltagelow === false && secondsumVoltagelow >= 4) {
            lineNotify.notify({
                message: '\n' +
                    'ฟฟ้าทำงานผิดปกติ \n' +
                    'phase 1 : ' + Voltagep1 + '\n' +
                    'phase 2 : ' + Voltagep2 + '\n' +
                    'phase 3 : ' + Voltagep3
            }).then(() => {
                console.log('send completed!');
            });
            notifysumVoltagelow = true;
            console.log(notifysumVoltagelow + "123");
        }

    } else {
        //console.log("รีค่าไฟ้าทำงานผิดปกติ")
        notifysumVoltagelow = false;
        secondsumVoltagelow = 0;
    }

});

https.createServer(options, app).listen(PORT, () => {
    console.log(`Listening at https://localhost:5000`);
});