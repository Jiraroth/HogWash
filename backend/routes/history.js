const express = require("express");
const pool = require("../config");

router = express.Router();

const { isLoggedIn } = require('../middlewares')

router.get("/history", isLoggedIn, async function (req, res, next) {

    const conn = await pool.getConnection()
    await conn.beginTransaction();

    try {
        const [historyRows, historyField] = await conn.query(
            "SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date, TIME(date) AS time FROM history WHERE user_id = ?",
            [req.user.id]
        )
        const [paymentRows, paymentField] = await conn.query(
            "SELECT * FROM payments",
            [historyRows[0].payment_id]
        )
        const [optionRows, optionField] = await conn.query(
            "SELECT * FROM options",
            [historyRows[0].option_id]
        )
        conn.commit()
        console.log(historyRows)
        return res.json({
            history: historyRows,
            payment: paymentRows,
            option: optionRows
        })
    } catch (err) {
        conn.rollback()
        return res.send(err);
    } finally {
        conn.release()
    }

});

// add history
router.post("/history", isLoggedIn, async function (req, res, next) {

    const conn = await pool.getConnection()
    await conn.beginTransaction();

    const { payment_choose, wm_choose, option_choose, wm_time } = req.body.params;

    try {
        const [rows, fields] = await conn.query(
            "INSERT INTO history(date, payment_id, wm_id, user_id, option_id) VALUES(CURRENT_TIMESTAMP, ?, ?, ?, ?)",
            [payment_choose, wm_choose, req.user.id, option_choose]
        )

        const [rowsTemp] = await conn.query(
            "SELECT * FROM washing_machine WHERE id = ?",
            [wm_choose]
        )

        console.log(wm_choose)

        const powderNum = +rowsTemp[0].powder - 5
        const softenerNum = +rowsTemp[0].softener - 5

        const [rows2] = await conn.query(
            "UPDATE washing_machine SET status = ?, powder = ?, softener = ?, used_by = ?, time = ? WHERE id = ?",
            [1, powderNum, softenerNum,  req.user.id, wm_time, wm_choose]
        )

        conn.commit()
        return res.json({
            message: 'History added successfully',
            data: rows2
        })
    } catch (err) {
        conn.rollback()
        return res.send(err);
    } finally {
        conn.release()
    }

})
exports.router = router;
