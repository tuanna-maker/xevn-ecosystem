"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceEventFanoutService = void 0;
const common_1 = require("@nestjs/common");
const hrm_realtime_service_1 = require("../realtime/hrm-realtime.service");
const hrm_inbox_service_1 = require("./hrm-inbox.service");
const push_outbound_service_1 = require("./push-outbound.service");
const webhook_outbound_service_1 = require("./webhook-outbound.service");
let AttendanceEventFanoutService = class AttendanceEventFanoutService {
    realtime;
    inbox;
    webhook;
    push;
    constructor(realtime, inbox, webhook, push) {
        this.realtime = realtime;
        this.inbox = inbox;
        this.webhook = webhook;
        this.push = push;
    }
    async dispatch(envelope) {
        this.realtime.publishAttendanceEvent(envelope);
        await this.inbox.persistAttendanceEnvelope(envelope);
        this.webhook.dispatchAttendanceEvent(envelope);
        this.push.dispatchAttendanceEvent(envelope);
    }
    async onUpdateRequestCreated(request) {
        await this.dispatch(this.envelopeAttendance('attendance_update_request.created', request));
    }
    async onUpdateRequestDecided(kind, request) {
        const type = kind === 'approved' ? 'attendance_update_request.approved' : 'attendance_update_request.rejected';
        await this.dispatch(this.envelopeAttendance(type, request));
    }
    envelopeAttendance(type, request) {
        return { type, at: new Date().toISOString(), request };
    }
    async onLeaveRequestCreated(request) {
        await this.dispatch({ type: 'leave_request.created', at: new Date().toISOString(), request });
    }
    async onLeaveRequestDecided(kind, request) {
        const type = kind === 'approved' ? 'leave_request.approved' : 'leave_request.rejected';
        await this.dispatch({ type, at: new Date().toISOString(), request });
    }
    async onServiceRequestCreated(request) {
        await this.dispatch({ type: 'service_request.created', at: new Date().toISOString(), request });
    }
    async onServiceRequestDecided(kind, request) {
        const type = kind === 'approved' ? 'service_request.approved' : 'service_request.rejected';
        await this.dispatch({ type, at: new Date().toISOString(), request });
    }
};
exports.AttendanceEventFanoutService = AttendanceEventFanoutService;
exports.AttendanceEventFanoutService = AttendanceEventFanoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_realtime_service_1.HrmRealtimeService,
        hrm_inbox_service_1.HrmInboxService,
        webhook_outbound_service_1.WebhookOutboundService,
        push_outbound_service_1.PushOutboundService])
], AttendanceEventFanoutService);
//# sourceMappingURL=attendance-event-fanout.service.js.map