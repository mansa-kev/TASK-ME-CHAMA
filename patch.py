import re

# 1. AuditLogs.tsx
with open('frontend/src/components/AuditLogs.tsx', 'r') as f:
    content = f.read()
    
# Add fetchAuditStats to imports
content = content.replace("import { fetchAuditLogs }", "import { fetchAuditLogs, fetchAuditStats }")

# Add state for stats
state_hook = """  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([
    { label: 'Security Events', icon: Lock, count: 0, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Financial Actions', icon: Activity, count: 0, color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
    { label: 'Config Changes', icon: UserCog, count: 0, color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20' },
    { label: 'System Automated', icon: Database, count: 0, color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20' }
  ]);"""
content = content.replace("  const [logs, setLogs] = useState<any[]>([]);", state_hook)

# Add fetch call in useEffect
effect_hook = """
    fetchAuditStats().then(data => {
      if(data && data.length) {
         setStats(prev => prev.map((item, i) => ({...item, count: data[i]?.count || 0})));
      }
    }).catch(console.error);
"""
content = content.replace("}).catch(console.error);\n  }, []);", "}).catch(console.error);" + effect_hook + "\n  }, []);")

# Replace hardcoded array in JSX
hardcoded = """[
          { label: 'Security Events', icon: Lock, count: 12, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'Financial Actions', icon: Activity, count: 89, color: 'text-brand-green', bg: 'bg-brand-green/10', border: 'border-brand-green/20' },
          { label: 'Config Changes', icon: UserCog, count: 4, color: 'text-brand-accent', bg: 'bg-brand-accent/10', border: 'border-brand-accent/20' },
          { label: 'System Automated', icon: Database, count: 1024, color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20' },
        ]"""
content = content.replace(hardcoded, "stats")

with open('frontend/src/components/AuditLogs.tsx', 'w') as f:
    f.write(content)

# 2. InventoryLedger.tsx
with open('frontend/src/components/InventoryLedger.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { createInventoryItem, assignInventoryItem, fetchInventoryItems } from '../api';", "import { createInventoryItem, assignInventoryItem, fetchInventoryItems, fetchMarketplaceItems } from '../api';\nimport { useEffect } from 'react';")

state_hook = """  const [assignForm, setAssignForm] = useState({ itemId: '', memberId: '' });
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  useEffect(() => {
    fetchMarketplaceItems().then(data => {
      if(data) setMarketplaceItems(data);
    }).catch(console.error);
  }, []);"""
content = content.replace("  const [assignForm, setAssignForm] = useState({ itemId: '', memberId: '' });", state_hook)

hardcoded = """  const marketplaceItems = [
    { id: 'M-01', name: 'Samsung 50" Smart TV', price: 65000, category: 'Electronics', available: true, image: '📺' },
    { id: 'M-02', name: 'HP EliteBook 840 G8', price: 85000, category: 'Electronics', available: true, image: '💻' },
    { id: 'M-03', name: 'Honda Dio Scooter', price: 145000, category: 'Vehicles', available: true, image: '🛵' },
    { id: 'M-04', name: 'Quarter Acre - Kamulu', price: 750000, category: 'Real Estate', available: false, image: '🏡' },
  ];"""
content = content.replace(hardcoded, "")

with open('frontend/src/components/InventoryLedger.tsx', 'w') as f:
    f.write(content)

