/**
 * @fileoverview Renderiza la notificación global (Alert flotante) en toda la app.
 */

import NotificacionPersonalizada from './NotificacionPersonalizada';
import useNotificationStore from '../store/notificationStore';

function NotificationHost() {
	const mostrar = useNotificationStore(state => state.mostrar);
	const mensaje = useNotificationStore(state => state.mensaje);
	const severidad = useNotificationStore(state => state.severidad);
	const duracionMs = useNotificationStore(state => state.duracionMs);
	const hideNotification = useNotificationStore(state => state.hideNotification);

	return (
		<NotificacionPersonalizada
			mensaje={mensaje}
			severidad={severidad}
			mostrar={mostrar}
			duracionMs={duracionMs}
			onClose={hideNotification}
		/>
	);
}

export default NotificationHost;
