const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["percentage", "amount"],
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        min_amount: {
            type: Number,
            required: true,
            min: 0,
        },
        dateDetail: {
            type: String,
            required: true,
        },
        maxUsage: {
            type: Number,
            required: true,
            min: 0,
        },
        timeRestriction: {
            type: Boolean,
            default: false,
        },
        timeDetail: {
            type: String,
        },
        // startTime: {
        //     type: String,
        //     validate: {
        //         validator: function(v) {
        //             return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        //         },
        //         message: props => `${props.value} is not a valid time format (HH:MM)`
        //     },
        //     default: "09:00"
        // },
        // endTime: {
        //     type: String,
        //     validate: {
        //         validator: function(v) {
        //             return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        //         },
        //         message: props => `${props.value} is not a valid time format (HH:MM)`
        //     },
        //     default: "17:00"
        // },
        daysActive: {
            monday: { type: Boolean, default: true },
            tuesday: { type: Boolean, default: true },
            wednesday: { type: Boolean, default: true },
            thursday: { type: Boolean, default: true },
            friday: { type: Boolean, default: true },
            saturday: { type: Boolean, default: true },
            sunday: { type: Boolean, default: true }
        },
        status: {
            type: Boolean,
            default: true,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const couponModel = mongoose.model("Coupon", CouponSchema);

module.exports = couponModel;