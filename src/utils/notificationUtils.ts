// src/utils/notificationUtils.ts
import { notificationApi, CreateNotificationRequest } from '../api/notificationApi';

export class NotificationUtils {
  
  /**
   * Créer une notification de stock faible
   */
  static async notifyLowStock(params: {
    productName: string;
    currentStock: number;
    minStock: number;
  }) {
    const notification: CreateNotificationRequest = {
      type: 'warning',
      title: 'Stock faible',
      message: `${params.productName} - Il ne reste que ${params.currentStock} unité${params.currentStock > 1 ? 's' : ''} en stock (seuil minimum: ${params.minStock})`,
      module: 'Stocks',
      actionUrl: '/stocks',
      metadata: {
        productName: params.productName,
        currentStock: params.currentStock,
        minStock: params.minStock,
        alertType: 'low_stock',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification stock faible créée:', params.productName);
    } catch (error) {
      console.error('Erreur lors de la création de la notification stock faible:', error);
    }
  }

  /**
   * Créer une notification de nouvelle vente
   */
  static async notifyNewSale(params: {
    saleAmount: number;
    saleId: string;
    customerName?: string;
  }) {
    const notification: CreateNotificationRequest = {
      type: 'success',
      title: 'Vente effectuée',
      message: `Une vente de ${params.saleAmount}€ a été enregistrée avec succès${params.customerName ? ` pour ${params.customerName}` : ''}`,
      module: 'Ventes',
      actionUrl: `/ventes/${params.saleId}`,
      metadata: {
        saleAmount: params.saleAmount,
        saleId: params.saleId,
        customerName: params.customerName,
        alertType: 'new_sale',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification nouvelle vente créée:', params.saleId);
    } catch (error) {
      console.error('Erreur lors de la création de la notification vente:', error);
    }
  }

  /**
   * Créer une notification de nouvelle commande
   */
  static async notifyNewOrder(params: {
    orderId: string;
    supplierName: string;
    orderAmount?: number;
  }) {
    const notification: CreateNotificationRequest = {
      type: 'info',
      title: 'Nouvelle commande',
      message: `Nouvelle commande reçue de ${params.supplierName}${params.orderAmount ? ` d'un montant de ${params.orderAmount}€` : ''}`,
      module: 'Commandes',
      actionUrl: `/commandes/${params.orderId}`,
      metadata: {
        orderId: params.orderId,
        supplierName: params.supplierName,
        orderAmount: params.orderAmount,
        alertType: 'new_order',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification nouvelle commande créée:', params.orderId);
    } catch (error) {
      console.error('Erreur lors de la création de la notification commande:', error);
    }
  }

  /**
   * Créer une notification de validation de document
   */
  static async notifyDocumentValidation(params: {
    documentType: string;
    isApproved: boolean;
    documentId?: string;
    reason?: string;
  }) {
    const notification: CreateNotificationRequest = {
      type: params.isApproved ? 'success' : 'error',
      title: `Document ${params.isApproved ? 'approuvé' : 'refusé'}`,
      message: `Votre ${params.documentType} a été ${params.isApproved ? 'approuvé' : 'refusé'}${params.reason ? ` - ${params.reason}` : ''}`,
      module: 'Documents',
      actionUrl: params.documentId ? `/documents/${params.documentId}` : '/documents',
      metadata: {
        documentType: params.documentType,
        isApproved: params.isApproved,
        documentId: params.documentId,
        reason: params.reason,
        alertType: 'document_validation',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification validation document créée:', params.documentType);
    } catch (error) {
      console.error('Erreur lors de la création de la notification document:', error);
    }
  }

  /**
   * Créer une notification de paiement
   */
  static async notifyPayment(params: {
    amount: number;
    status: 'success' | 'failed' | 'pending';
    paymentMethod?: string;
    transactionId?: string;
  }) {
    const statusMessages = {
      success: 'Paiement effectué',
      failed: 'Paiement échoué',
      pending: 'Paiement en attente',
    };

    const statusTypes = {
      success: 'success' as const,
      failed: 'error' as const,
      pending: 'warning' as const,
    };

    const notification: CreateNotificationRequest = {
      type: statusTypes[params.status],
      title: statusMessages[params.status],
      message: `Paiement de ${params.amount}€${params.paymentMethod ? ` par ${params.paymentMethod}` : ''} - ${statusMessages[params.status].toLowerCase()}`,
      module: 'Paiements',
      actionUrl: '/paiements',
      metadata: {
        amount: params.amount,
        status: params.status,
        paymentMethod: params.paymentMethod,
        transactionId: params.transactionId,
        alertType: 'payment_status',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification paiement créée:', params.status);
    } catch (error) {
      console.error('Erreur lors de la création de la notification paiement:', error);
    }
  }

  /**
   * Créer une notification système
   */
  static async notifySystem(params: {
    message: string;
    severity: 'info' | 'warning' | 'error';
    actionUrl?: string;
  }) {
    const notification: CreateNotificationRequest = {
      type: params.severity === 'info' ? 'system' : params.severity,
      title: 'Notification système',
      message: params.message,
      module: 'Système',
      actionUrl: params.actionUrl,
      isGlobal: true, // Les notifications système sont globales par défaut
      metadata: {
        severity: params.severity,
        alertType: 'system_notification',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification système créée:', params.severity);
    } catch (error) {
      console.error('Erreur lors de la création de la notification système:', error);
    }
  }

  /**
   * Créer une notification de nouvelle commission
   */
  static async notifyCommission(params: {
    amount: number;
    agentName: string;
    saleId: string;
    commissionRate?: number;
  }) {
    const notification: CreateNotificationRequest = {
      type: 'success',
      title: 'Nouvelle commission',
      message: `Commission de ${params.amount}€ générée pour ${params.agentName}${params.commissionRate ? ` (${params.commissionRate}%)` : ''}`,
      module: 'Commissions',
      actionUrl: `/commissions`,
      metadata: {
        amount: params.amount,
        agentName: params.agentName,
        saleId: params.saleId,
        commissionRate: params.commissionRate,
        alertType: 'new_commission',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification commission créée:', params.agentName);
    } catch (error) {
      console.error('Erreur lors de la création de la notification commission:', error);
    }
  }

  /**
   * Créer une notification de retour produit
   */
  static async notifyReturn(params: {
    returnId: string;
    productName: string;
    quantity: number;
    reason?: string;
  }) {
    const notification: CreateNotificationRequest = {
      type: 'warning',
      title: 'Retour produit',
      message: `Retour de ${params.quantity} ${params.productName}${params.reason ? ` - Raison: ${params.reason}` : ''}`,
      module: 'Stocks',
      actionUrl: `/returns/${params.returnId}`,
      metadata: {
        returnId: params.returnId,
        productName: params.productName,
        quantity: params.quantity,
        reason: params.reason,
        alertType: 'product_return',
      },
    };

    try {
      await notificationApi.createNotification(notification);
      console.log('Notification retour créée:', params.returnId);
    } catch (error) {
      console.error('Erreur lors de la création de la notification retour:', error);
    }
  }

  /**
   * Créer une notification personnalisée
   */
  static async notifyCustom(params: CreateNotificationRequest) {
    try {
      await notificationApi.createNotification(params);
      console.log('Notification personnalisée créée:', params.title);
    } catch (error) {
      console.error('Erreur lors de la création de la notification personnalisée:', error);
    }
  }
}

// Fonctions d'aide pour utiliser les notifications facilement
export const notifyLowStock = NotificationUtils.notifyLowStock;
export const notifyNewSale = NotificationUtils.notifyNewSale;
export const notifyNewOrder = NotificationUtils.notifyNewOrder;
export const notifyDocumentValidation = NotificationUtils.notifyDocumentValidation;
export const notifyPayment = NotificationUtils.notifyPayment;
export const notifySystem = NotificationUtils.notifySystem;
export const notifyCommission = NotificationUtils.notifyCommission;
export const notifyReturn = NotificationUtils.notifyReturn;
export const notifyCustom = NotificationUtils.notifyCustom;