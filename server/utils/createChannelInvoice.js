const ChannelInvoice = require("../models/ChannelInvoice");

// createChannelInvoice for paid channels 
const createChannelInvoice = async (channel) => {
    try {
        const { _id, patientName, contactNo, channelDate, channelFee, channelNo } = channel; 

        // Calculate total fees 
        const institutionFee = 600; 
        const total = channelFee + institutionFee; 

        // Generate a reference number 
        const refNo = Date.now(); // Using current timestamp

        // Create the invoice 
        const invoice = new ChannelInvoice({
            refNo, 
            patientName, 
            contactNo, 
            channelDate, 
            patientNo: channelNo, 
            doctorFee: channelFee, 
            institutionFee, 
            total,
        });

        // Save the invoice to the database 
        await invoice.save();
    } catch (error) {
        console.error('Error creating channel invoice:', error.message);
        throw new Error('Failed to create channel invoice.');
    }
}

module.exports = {
    createChannelInvoice
}