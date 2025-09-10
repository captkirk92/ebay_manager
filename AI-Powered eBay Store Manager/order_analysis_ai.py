#!/usr/bin/env python3
"""
Order Financial & Fulfillment Analysis AI
Analyzes eBay orders for payment, shipping, returns, and profitability
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from ebay_api_client import eBayAPIClient


@dataclass
class OrderAnalysis:
    """Data structure for individual order analysis"""
    order_id: str
    status: str
    analysis: Dict[str, str]
    profit: Dict[str, Any]
    action_required: List[str]
    risk_score: int  # 0-100, higher = more risk


@dataclass
class StoreHealthReport:
    """Data structure for store-wide order health report"""
    report_date: str
    total_orders: int
    orders_needing_attention: int
    total_revenue: float
    total_profit: float
    average_margin: float
    critical_issues: List[str]
    recommendations: List[str]
    health_score: int  # 0-100


class OrderFinancialAnalysisAI:
    """AI system for analyzing eBay orders and store financial health"""
    
    def __init__(self):
        self.client = eBayAPIClient()
        
        # Risk thresholds
        self.LOW_MARGIN_THRESHOLD = 0.10  # 10%
        self.SHIPPING_DELAY_HOURS = 24
        self.HIGH_RISK_SCORE = 70
        
        # eBay fee estimates (approximate)
        self.EBAY_FINAL_VALUE_FEE = 0.129  # 12.9% average
        self.PAYPAL_FEE_RATE = 0.0349  # 3.49%
        self.PAYPAL_FIXED_FEE = 0.49
    
    def analyze_order(self, order_data: Dict) -> OrderAnalysis:
        """
        Analyze a single order for payment, shipping, returns, and profitability
        
        Args:
            order_data: Raw order data from eBay API
            
        Returns:
            OrderAnalysis object with complete analysis
        """
        try:
            order_id = order_data.get('orderId', order_data.get('OrderID', 'Unknown'))
            
            # Initialize analysis components
            payment_check = self._analyze_payment(order_data)
            shipping_check = self._analyze_shipping(order_data)
            returns_check = self._analyze_returns(order_data)
            profit_analysis = self._calculate_profit(order_data)
            
            # Determine overall status
            status = self._determine_order_status(order_data)
            
            # Generate action items
            actions = self._generate_action_items(
                payment_check, shipping_check, returns_check, profit_analysis
            )
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(
                payment_check, shipping_check, returns_check, profit_analysis
            )
            
            return OrderAnalysis(
                order_id=order_id,
                status=status,
                analysis={
                    'paymentCheck': payment_check['message'],
                    'shippingCheck': shipping_check['message'],
                    'returnsCheck': returns_check['message'],
                    'profitCheck': profit_analysis['message']
                },
                profit={
                    'gross': profit_analysis['gross'],
                    'net': profit_analysis['net'],
                    'margin': f"{profit_analysis['margin']:.1f}%"
                },
                action_required=actions,
                risk_score=risk_score
            )
            
        except Exception as e:
            # Return error analysis
            return OrderAnalysis(
                order_id=order_id,
                status="Error",
                analysis={
                    'paymentCheck': f"❌ Analysis error: {str(e)}",
                    'shippingCheck': "❌ Unable to analyze",
                    'returnsCheck': "❌ Unable to analyze",
                    'profitCheck': "❌ Unable to analyze"
                },
                profit={'gross': 0.0, 'net': 0.0, 'margin': '0.0%'},
                action_required=["Review order data manually"],
                risk_score=100
            )
    
    def _analyze_payment(self, order_data: Dict) -> Dict:
        """Analyze payment status and payout information"""
        try:
            payment_status = order_data.get('payment', {}).get('status', 'Unknown')
            amount = float(order_data.get('payment', {}).get('amount', 0))
            payout_status = order_data.get('payout', {}).get('status', 'Pending')
            
            if payment_status.lower() in ['paid', 'completed']:
                if payout_status.lower() in ['completed', 'processed']:
                    return {
                        'status': 'good',
                        'message': '✅ Payment received and payout completed',
                        'amount': amount
                    }
                else:
                    return {
                        'status': 'warning',
                        'message': '⚠️ Payment received, payout pending',
                        'amount': amount
                    }
            elif payment_status.lower() in ['pending']:
                return {
                    'status': 'critical',
                    'message': '🔴 Payment still pending',
                    'amount': amount
                }
            else:
                return {
                    'status': 'critical',
                    'message': f'❌ Payment issue: {payment_status}',
                    'amount': amount
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'❌ Payment analysis error: {str(e)}',
                'amount': 0.0
            }
    
    def _analyze_shipping(self, order_data: Dict) -> Dict:
        """Analyze shipping label purchase and tracking status"""
        try:
            shipping_data = order_data.get('shipping', {})
            label_purchased = shipping_data.get('purchased', False)
            tracking_number = shipping_data.get('trackingNumber')
            ship_date = shipping_data.get('shipDate')
            delivery_status = shipping_data.get('deliveryStatus', 'Not Shipped')
            
            # Check for shipping delays
            order_date = order_data.get('orderDate', datetime.now().isoformat())
            order_datetime = datetime.fromisoformat(order_date.replace('Z', '+00:00'))
            hours_since_order = (datetime.now() - order_datetime.replace(tzinfo=None)).total_seconds() / 3600
            
            if delivery_status.lower() in ['delivered']:
                return {
                    'status': 'good',
                    'message': '✅ Order delivered successfully',
                    'tracking': tracking_number
                }
            elif label_purchased and tracking_number:
                return {
                    'status': 'good',
                    'message': '✅ Shipping label purchased, tracking uploaded',
                    'tracking': tracking_number
                }
            elif label_purchased and not tracking_number:
                return {
                    'status': 'warning',
                    'message': '⚠️ Label purchased but tracking not uploaded',
                    'tracking': None
                }
            elif not label_purchased and hours_since_order > self.SHIPPING_DELAY_HOURS:
                return {
                    'status': 'critical',
                    'message': f'🔴 Shipping delayed - {hours_since_order:.1f}h since order',
                    'tracking': None
                }
            elif not label_purchased:
                return {
                    'status': 'warning',
                    'message': '⚠️ Shipping label not purchased yet',
                    'tracking': None
                }
            else:
                return {
                    'status': 'good',
                    'message': '✅ Shipping on track',
                    'tracking': tracking_number
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'❌ Shipping analysis error: {str(e)}',
                'tracking': None
            }
    
    def _analyze_returns(self, order_data: Dict) -> Dict:
        """Analyze return requests and refund status"""
        try:
            returns_data = order_data.get('returns', {})
            has_return = returns_data.get('hasReturn', False)
            return_status = returns_data.get('status', 'None')
            refund_amount = float(returns_data.get('refundAmount', 0))
            
            if not has_return:
                return {
                    'status': 'good',
                    'message': '✅ No returns reported',
                    'refund_amount': 0.0
                }
            elif return_status.lower() in ['closed', 'resolved']:
                return {
                    'status': 'warning',
                    'message': f'⚠️ Return resolved - ${refund_amount:.2f} refunded',
                    'refund_amount': refund_amount
                }
            elif return_status.lower() in ['open', 'pending']:
                return {
                    'status': 'critical',
                    'message': '🔴 Open return request needs attention',
                    'refund_amount': refund_amount
                }
            else:
                return {
                    'status': 'warning',
                    'message': f'⚠️ Return status: {return_status}',
                    'refund_amount': refund_amount
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'message': f'❌ Returns analysis error: {str(e)}',
                'refund_amount': 0.0
            }
    
    def _calculate_profit(self, order_data: Dict) -> Dict:
        """Calculate net profit and margin analysis"""
        try:
            # Extract financial data
            gross_amount = float(order_data.get('payment', {}).get('amount', 0))
            shipping_cost = float(order_data.get('shipping', {}).get('cost', 0))
            refund_amount = float(order_data.get('returns', {}).get('refundAmount', 0))
            
            # Calculate fees
            ebay_fees = gross_amount * self.EBAY_FINAL_VALUE_FEE
            paypal_fees = (gross_amount * self.PAYPAL_FEE_RATE) + self.PAYPAL_FIXED_FEE
            
            # Calculate net profit
            total_fees = ebay_fees + paypal_fees + shipping_cost + refund_amount
            net_profit = gross_amount - total_fees
            
            # Calculate margin
            margin = (net_profit / gross_amount * 100) if gross_amount > 0 else 0
            
            # Generate message based on margin
            if margin >= 50:
                message = f'✅ Excellent profit margin ({margin:.1f}%)'
                status = 'good'
            elif margin >= 25:
                message = f'✅ Good profit margin ({margin:.1f}%)'
                status = 'good'
            elif margin >= self.LOW_MARGIN_THRESHOLD * 100:
                message = f'⚠️ Low profit margin ({margin:.1f}%)'
                status = 'warning'
            elif margin >= 0:
                message = f'🔴 Very low profit margin ({margin:.1f}%)'
                status = 'critical'
            else:
                message = f'❌ Loss on this order ({margin:.1f}%)'
                status = 'critical'
            
            return {
                'status': status,
                'message': message,
                'gross': gross_amount,
                'net': net_profit,
                'margin': margin,
                'fees_breakdown': {
                    'ebay_fees': ebay_fees,
                    'paypal_fees': paypal_fees,
                    'shipping_cost': shipping_cost,
                    'refunds': refund_amount
                }
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'❌ Profit calculation error: {str(e)}',
                'gross': 0.0,
                'net': 0.0,
                'margin': 0.0
            }
    
    def _determine_order_status(self, order_data: Dict) -> str:
        """Determine overall order status"""
        try:
            payment_status = order_data.get('payment', {}).get('status', 'Unknown')
            shipping_data = order_data.get('shipping', {})
            delivery_status = shipping_data.get('deliveryStatus', 'Not Shipped')
            has_return = order_data.get('returns', {}).get('hasReturn', False)
            
            if has_return:
                return "Returned"
            elif delivery_status.lower() in ['delivered']:
                return "Delivered"
            elif shipping_data.get('trackingNumber'):
                return "Shipped"
            elif payment_status.lower() in ['paid', 'completed']:
                return "Paid - Not Shipped"
            elif payment_status.lower() in ['pending']:
                return "Payment Pending"
            else:
                return "Unknown"
                
        except Exception:
            return "Error"
    
    def _generate_action_items(self, payment_check: Dict, shipping_check: Dict, 
                             returns_check: Dict, profit_analysis: Dict) -> List[str]:
        """Generate specific action items based on analysis"""
        actions = []
        
        # Payment actions
        if payment_check['status'] == 'critical':
            actions.append("Wait for payment before shipping")
        
        # Shipping actions
        if shipping_check['status'] == 'critical':
            if 'delayed' in shipping_check['message'].lower():
                actions.append("Ship immediately to avoid late shipment defect")
            else:
                actions.append("Purchase and upload shipping label")
        elif shipping_check['status'] == 'warning':
            if 'tracking not uploaded' in shipping_check['message'].lower():
                actions.append("Upload tracking number to avoid defect")
        
        # Returns actions
        if returns_check['status'] == 'critical':
            actions.append("Resolve return request per eBay policy")
        
        # Profit actions
        if profit_analysis['status'] == 'critical':
            if profit_analysis['margin'] < 0:
                actions.append("Investigate loss - consider pricing adjustment")
            else:
                actions.append("Review pricing strategy for better margins")
        
        # Default action if no specific issues
        if not actions:
            actions.append("Order looks good - monitor for updates")
        
        return actions
    
    def _calculate_risk_score(self, payment_check: Dict, shipping_check: Dict, 
                            returns_check: Dict, profit_analysis: Dict) -> int:
        """Calculate overall risk score (0-100, higher = more risk)"""
        risk_score = 0
        
        # Payment risk
        if payment_check['status'] == 'critical':
            risk_score += 40
        elif payment_check['status'] == 'warning':
            risk_score += 20
        
        # Shipping risk
        if shipping_check['status'] == 'critical':
            risk_score += 30
        elif shipping_check['status'] == 'warning':
            risk_score += 15
        
        # Returns risk
        if returns_check['status'] == 'critical':
            risk_score += 25
        elif returns_check['status'] == 'warning':
            risk_score += 10
        
        # Profit risk
        if profit_analysis['status'] == 'critical':
            risk_score += 15
        elif profit_analysis['status'] == 'warning':
            risk_score += 5
        
        return min(risk_score, 100)
    
    def generate_store_health_report(self, orders_data: List[Dict]) -> StoreHealthReport:
        """
        Generate aggregated store-wide order health report
        
        Args:
            orders_data: List of order data from eBay API
            
        Returns:
            StoreHealthReport with aggregated analysis
        """
        try:
            if not orders_data:
                return StoreHealthReport(
                    report_date=datetime.now().isoformat(),
                    total_orders=0,
                    orders_needing_attention=0,
                    total_revenue=0.0,
                    total_profit=0.0,
                    average_margin=0.0,
                    critical_issues=["No orders to analyze"],
                    recommendations=["Focus on generating more sales"],
                    health_score=50
                )
            
            # Analyze all orders
            analyses = [self.analyze_order(order) for order in orders_data]
            
            # Calculate aggregated metrics
            total_orders = len(analyses)
            orders_needing_attention = sum(1 for a in analyses if a.risk_score >= self.HIGH_RISK_SCORE)
            total_revenue = sum(a.profit['gross'] for a in analyses)
            total_profit = sum(a.profit['net'] for a in analyses)
            average_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
            
            # Identify critical issues
            critical_issues = []
            payment_issues = sum(1 for a in analyses if 'Payment' in str(a.action_required))
            shipping_issues = sum(1 for a in analyses if any('shipping' in action.lower() for action in a.action_required))
            return_issues = sum(1 for a in analyses if any('return' in action.lower() for action in a.action_required))
            profit_issues = sum(1 for a in analyses if any('pricing' in action.lower() or 'margin' in action.lower() for action in a.action_required))
            
            if payment_issues > 0:
                critical_issues.append(f"{payment_issues} orders with payment issues")
            if shipping_issues > 0:
                critical_issues.append(f"{shipping_issues} orders need shipping attention")
            if return_issues > 0:
                critical_issues.append(f"{return_issues} orders have return requests")
            if profit_issues > 0:
                critical_issues.append(f"{profit_issues} orders have low profitability")
            
            # Generate recommendations
            recommendations = self._generate_store_recommendations(analyses, {
                'payment_issues': payment_issues,
                'shipping_issues': shipping_issues,
                'return_issues': return_issues,
                'profit_issues': profit_issues,
                'average_margin': average_margin
            })
            
            # Calculate overall health score
            health_score = self._calculate_store_health_score(analyses, {
                'orders_needing_attention': orders_needing_attention,
                'total_orders': total_orders,
                'average_margin': average_margin,
                'critical_issues_count': len(critical_issues)
            })
            
            return StoreHealthReport(
                report_date=datetime.now().isoformat(),
                total_orders=total_orders,
                orders_needing_attention=orders_needing_attention,
                total_revenue=total_revenue,
                total_profit=total_profit,
                average_margin=average_margin,
                critical_issues=critical_issues if critical_issues else ["No critical issues detected"],
                recommendations=recommendations,
                health_score=health_score
            )
            
        except Exception as e:
            return StoreHealthReport(
                report_date=datetime.now().isoformat(),
                total_orders=0,
                orders_needing_attention=0,
                total_revenue=0.0,
                total_profit=0.0,
                average_margin=0.0,
                critical_issues=[f"Report generation error: {str(e)}"],
                recommendations=["Review order data and try again"],
                health_score=0
            )
    
    def _generate_store_recommendations(self, analyses: List[OrderAnalysis], metrics: Dict) -> List[str]:
        """Generate store-wide recommendations based on order analysis"""
        recommendations = []
        
        # Shipping recommendations
        if metrics['shipping_issues'] > metrics.get('total_orders', 1) * 0.2:  # >20% have shipping issues
            recommendations.append("Implement automated shipping workflow to reduce delays")
        
        # Profitability recommendations
        if metrics['average_margin'] < 20:
            recommendations.append("Review pricing strategy - consider increasing prices or reducing costs")
        elif metrics['average_margin'] > 60:
            recommendations.append("Excellent margins! Consider expanding product line")
        
        # Returns recommendations
        if metrics['return_issues'] > 0:
            recommendations.append("Review return patterns to improve product descriptions and quality")
        
        # Payment recommendations
        if metrics['payment_issues'] > 0:
            recommendations.append("Follow up on pending payments and review payment policies")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Store operations are running smoothly - maintain current processes")
        
        return recommendations
    
    def _calculate_store_health_score(self, analyses: List[OrderAnalysis], metrics: Dict) -> int:
        """Calculate overall store health score (0-100)"""
        base_score = 100
        
        # Deduct for orders needing attention
        attention_ratio = metrics['orders_needing_attention'] / max(metrics['total_orders'], 1)
        base_score -= int(attention_ratio * 40)  # Max 40 point deduction
        
        # Deduct for low margins
        if metrics['average_margin'] < 10:
            base_score -= 20
        elif metrics['average_margin'] < 20:
            base_score -= 10
        
        # Deduct for critical issues
        base_score -= min(metrics['critical_issues_count'] * 5, 20)  # Max 20 point deduction
        
        # Bonus for good performance
        if metrics['orders_needing_attention'] == 0:
            base_score += 10
        
        return max(0, min(100, base_score))


def main():
    """Test the Order Financial Analysis AI"""
    # Sample test data
    test_order = {
        'orderId': '12345',
        'orderDate': datetime.now().isoformat(),
        'payment': {'status': 'Paid', 'amount': 29.99},
        'shipping': {'purchased': False, 'cost': 4.25, 'trackingNumber': None},
        'returns': {'hasReturn': False, 'refundAmount': 0.0},
        'payout': {'status': 'Pending'}
    }
    
    analyzer = OrderFinancialAnalysisAI()
    
    # Test individual order analysis
    analysis = analyzer.analyze_order(test_order)
    print("Individual Order Analysis:")
    print(json.dumps({
        'orderId': analysis.order_id,
        'status': analysis.status,
        'analysis': analysis.analysis,
        'profit': analysis.profit,
        'actionRequired': analysis.action_required,
        'riskScore': analysis.risk_score
    }, indent=2))
    
    # Test store health report
    test_orders = [test_order] * 3  # Simulate 3 similar orders
    health_report = analyzer.generate_store_health_report(test_orders)
    
    print("\nStore Health Report:")
    print(json.dumps({
        'reportDate': health_report.report_date,
        'totalOrders': health_report.total_orders,
        'ordersNeedingAttention': health_report.orders_needing_attention,
        'totalRevenue': health_report.total_revenue,
        'totalProfit': health_report.total_profit,
        'averageMargin': f"{health_report.average_margin:.1f}%",
        'criticalIssues': health_report.critical_issues,
        'recommendations': health_report.recommendations,
        'healthScore': health_report.health_score
    }, indent=2))


if __name__ == "__main__":
    main()
