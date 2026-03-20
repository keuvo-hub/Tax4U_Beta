const {Router} = require('express');
const {userAuth} = require('../auth');
const {
    deleteTicketPriority,
    delTicketSetting, getTicket,
    getTicketDepartment, getTicketPriority,
    getTicketType, postTicket, postTicketPriority,
    postTicketSetting,
    postTicketDepartment,
    ticketDepartmentList,
    postTicketType, fetchTicketTypeList, fetchTicketEmployeeList, postTicketMessage, getTicketByUser, postTicketNotes
} = require('../controllers/ticket');
const {protect} = require("../middleware/authProtect");

const ticket = Router();
ticket.get('/', getTicket);
ticket.post('/', protect, postTicket);
ticket.get('/by-user', protect, getTicketByUser);
ticket.post('/message', postTicketMessage);
ticket.post('/note', postTicketNotes);
ticket.get('/priorities', getTicketPriority);
ticket.post('/priorities', postTicketPriority);
ticket.delete('/priorities', deleteTicketPriority);
ticket.get('/department', getTicketDepartment);
ticket.get('/type', getTicketType);
ticket.post('/settings', postTicketSetting);
ticket.delete('/settings', delTicketSetting);
ticket.post('/department', userAuth({isAdmin: true}), postTicketDepartment);
ticket.get('/department-list', ticketDepartmentList);
ticket.post('/type', userAuth({isAdmin: true}), postTicketType);
ticket.get('/type-list', fetchTicketTypeList);
ticket.get('/employee-list', fetchTicketEmployeeList);

module.exports = ticket;
