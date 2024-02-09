import express from 'express';
import {createUser , getCurrentUser , getUser, loginUser } from '../controllers/users';
import { refreshAccessToken } from '../controllers/external';
import { checkOutPage, checkPaymentStatus, getAllPlans, mapThePlansToUser } from '../controllers/subscriptions';
import { requireProPlan, requireUltimatePlan } from '../middleware/paid_plans';
import {getUserGroups , creategroup  ,addUserToGroup} from '../controllers/userGroup'

const root = express.Router()

root.get('/user', getUser)
root.get('/me', getCurrentUser)
root.post('/register', createUser)
root.post('/login', loginUser)
root.get('/refresh',refreshAccessToken)
root.get('/plans' , getAllPlans)
root.post('/apply-plan',mapThePlansToUser)
root.get('/redirect-to-payment/:sessionId',checkOutPage)
root.post('/check-payment-status', express.raw({type: 'application/json'}) , checkPaymentStatus);
root.get('/get-user-groups', getUserGroups)
root.post('/create-group', creategroup)
root.post('/add-user-to-group', addUserToGroup)
export default root