const SerialPort = require("serialport");

const Commands = {
    M1FORWARD:                  0,
    M1BACKWARD:                 1,
    SETMINMB:                   2,
    SETMAXMB:                   3,
    M2FORWARD:                  4,
    M2BACKWARD:                 5,
    M17BIT:                     6,
    M27BIT:                     7,
    MIXEDFORWARD:               8,
    MIXEDBACKWARD:              9,
    MIXEDRIGHT:                 10,
    MIXEDLEFT:                  11,
    MIXEDFB:                    12,
    MIXEDLR:                    13,
    GETM1ENC:                   16,
    GETM2ENC:                   17,
    GETM1SPEED:                 18,
    GETM2SPEED:                 19,
    RESETENC:                   20,
    GETVERSION:                 21,
    SETM1ENCCOUNT:              22,
    SETM2ENCCOUNT:              23,
    GETMBATT:                   24,
    GETLBATT:                   25,
    SETMINLB:                   26,
    SETMAXLB:                   27,
    SETM1PID:                   28,
    SETM2PID:                   29,
    GETM1ISPEED:                30,
    GETM2ISPEED:                31,
    M1DUTY:                     32,
    M2DUTY:                     33,
    MIXEDDUTY:                  34,
    M1SPEED:                    35,
    M2SPEED:                    36,
    MIXEDSPEED:                 37,
    M1SPEEDACCEL:               38,
    M2SPEEDACCEL:               39,
    MIXEDSPEEDACCEL:            40,
    M1SPEEDDIST:                41,
    M2SPEEDDIST:                42,
    MIXEDSPEEDDIST:             43,
    M1SPEEDACCELDIST:           44,
    M2SPEEDACCELDIST:           45,
    MIXEDSPEEDACCELDIST:        46,
    GETBUFFERS:                 47,
    GETPWMS:                    48,
    GETCURRENTS:                49,
    MIXED2SPEEDACCEL:           50,
    MIXED2SPEEDACCELDIST:       51,
    M1DUTYACCEL:                52,
    M2DUTYACCEL:                53,
    MIXEDDUTYACCEL:             54,
    READM1PID:                  55,
    READM2PID:                  56,
    SETMAINVOLTAGES:            57,
    SETLOGICVOLTAGES:           58,
    GETMINMAXMAINVOLTAGES:      59,
    GETMINMAXLOGICVOLTAGES:     60,
    SETM1POSPID:                61,
    SETM2POSPID:                62,
    READM1POSPID:               63,
    READM2POSPID:               64,
    M1SPEEDACCELDECELPOS:       65,
    M2SPEEDACCELDECELPOST:      66,
    MIXEDSPEEDACCELDECELPOS:    67,
    SETM1DEFAULTACCEL:          68,
    SETM2DEFAULTACCEL:          69,
    SETPINFUNCTIONS:            74,
    GETPINFUNCTIONS:            75,
    SETDEADBAND:                76,
    GETDEADBAND:                77,
    GETENCODERS:                78,
    GETISPEEDS:                 79,
    RESTOREDEFAULTS:            80,
    GETTEMP:                    82,
    GETTEMP2:                   83,
    GETERROR:                   90,
    GETENCODERMODE:             91,
    SETM1ENCODERMODE:           92,
    SETM2ENCODERMODE:           93,
    WRITENVM:                   94,
    READNVM:                    95,
    SETCONFIG:                  98,
    GETCONFIG:                  99,
    SETM1MAXCURRENT:            133,
    SETM2MAXCURRENT:            134,
    GETM1MAXCURRENT:            135,
    GETM2MAXCURRENT:            136,
    SETPWMMODE:                 148,
    GETPWMMODE:                 149,
    FLAGBOOTLOADER:             255,
};

class RoboClaw {
    constructor(opts) {
        if (!opts.port) {
            throw new Error("No Serial Port defined");
        }

        this.d_serialPort = new SerialPort(opts.port);
        this.d_requestQueue = [];
        this.d_buffer = Buffer.alloc(0);

        this.d_serialPort.on('data', this._handleSerialData.bind(this));
    }

    _handleSerialData(incomingDataBuf) {
        // Add to the buffer first
        const totalSize - this.d_buffer.size + incomingDataBuf.size;
        this.d_buffer = Buffer.concat([this.d_buffer, incomingDataBuf], totalSize);

        // Go through each of the requests and attempt to read that many bytes
        while (this.d_requestQueue.length > 0) {
            const dataRequest = this.d_requestQueue[0];

            if (this.d_buffer.size >= dataRequest.numBytes) {
                // We have enough in the buffer to fulfill this request
                var newBuf = Buffer.from(this.d_buffer.slice(0, dataRequest.numBytes));
                this.d_buffer = Buffer.from(this.d_buffer.slice(dataRequest.numBytes));

                dataRequest.resolve(newBuf);
                this.d_requestQueue.shift();
            }
        }
    }
}