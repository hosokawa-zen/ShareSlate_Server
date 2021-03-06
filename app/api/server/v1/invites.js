import { Meteor } from 'meteor/meteor';

import { API } from '../api';
import { findOrCreateInvite } from '../../../invites/server/functions/findOrCreateInvite';
import { removeInvite } from '../../../invites/server/functions/removeInvite';
import { listInvites } from '../../../invites/server/functions/listInvites';
import { useInviteToken } from '../../../invites/server/functions/useInviteToken';
import { validateInviteToken } from '../../../invites/server/functions/validateInviteToken';

API.v1.addRoute('listInvites', { authRequired: true }, {
	get() {
		const result = listInvites(this.userId);
		return API.v1.success(result);
	},
});

API.v1.addRoute('findOrCreateInvite', { authRequired: true }, {
	post() {
		const { rid, days, maxUses } = this.bodyParams;
		const result = findOrCreateInvite(this.userId, { rid, days, maxUses });

		return API.v1.success(result);
	},
});

API.v1.addRoute('removeInvite/:_id', { authRequired: true }, {
	delete() {
		const { _id } = this.urlParams;
		const result = removeInvite(this.userId, { _id });

		return API.v1.success(result);
	},
});

API.v1.addRoute('useInviteToken', { authRequired: true }, {
	post() {
		const { token } = this.bodyParams;
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const result = useInviteToken(this.userId, token);

		return API.v1.success(result);
	},
});

API.v1.addRoute('validateInviteToken', { authRequired: false }, {
	post() {
		const { token } = this.bodyParams;

		if (!token) {
			throw new Meteor.Error('error-invalid-token', 'The invite token is invalid.', { method: 'validateInviteToken', field: 'token' });
		}

		let valid = true;
		try {
			validateInviteToken(token);
		} catch (e) {
			valid = false;
		}

		return API.v1.success({ valid });
	},
});

API.v1.addRoute('inviteByEmails', { authRequired: true }, {
	post() {
		const { emails, message } = this.bodyParams;
		// eslint-disable-next-line react-hooks/rules-of-hooks
		Meteor.runAsUser(this.userId, () => Meteor.call('sendInvitationEmailWithMessage', emails, message));

		return API.v1.success();
	},
});
