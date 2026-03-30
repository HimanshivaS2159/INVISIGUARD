import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  type: 'user' | 'merchant' | 'device' | 'location';
  risk: number;
  label: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
  fraud: boolean;
}

interface NetworkGraphProps {
  transactions?: Array<{
    user_id: string;
    merchant_category?: string;
    risk_score: number;
    result: string;
  }>;
  width?: number;
  height?: number;
}

const typeColor = (type: string, risk: number) => {
  if (type === 'user')     return risk > 70 ? '#EF4444' : risk > 40 ? '#F59E0B' : '#A855F7';
  if (type === 'merchant') return '#6366F1';
  if (type === 'device')   return '#10B981';
  return '#9B8EC4';
};

const typeRadius = (type: string) => {
  if (type === 'user')     return 10;
  if (type === 'merchant') return 14;
  if (type === 'device')   return 8;
  return 8;
};

// Generate demo graph data
function buildGraphData(transactions: NetworkGraphProps['transactions'] = []) {
  const nodes: Node[] = [];
  const links: Link[] = [];
  const nodeSet = new Set<string>();

  // Add merchant nodes
  const merchants = ['Food', 'Electronics', 'Travel', 'Shopping', 'Crypto', 'Utilities'];
  merchants.forEach(m => {
    const id = `merchant_${m}`;
    if (!nodeSet.has(id)) {
      nodes.push({ id, type: 'merchant', risk: m === 'Crypto' ? 80 : m === 'Electronics' ? 50 : 20, label: m });
      nodeSet.add(id);
    }
  });

  // Add device nodes
  ['Mobile_A', 'Desktop_B', 'Mobile_C', 'Tablet_D', 'Unknown_E'].forEach(d => {
    const id = `device_${d}`;
    nodes.push({ id, type: 'device', risk: d.includes('Unknown') ? 70 : 20, label: d.split('_')[0] });
    nodeSet.add(id);
  });

  // Use real transactions or generate demo
  const txData = transactions.length > 0 ? transactions : [
    { user_id: 'user_4821', merchant_category: 'Food',        risk_score: 15, result: 'SAFE' },
    { user_id: 'user_1093', merchant_category: 'Electronics', risk_score: 82, result: 'FRAUD' },
    { user_id: 'user_7732', merchant_category: 'Shopping',    risk_score: 22, result: 'SAFE' },
    { user_id: 'user_2241', merchant_category: 'Travel',      risk_score: 55, result: 'SAFE' },
    { user_id: 'user_9901', merchant_category: 'Crypto',      risk_score: 91, result: 'FRAUD' },
    { user_id: 'user_3312', merchant_category: 'Utilities',   risk_score: 8,  result: 'SAFE' },
    { user_id: 'user_5543', merchant_category: 'Electronics', risk_score: 72, result: 'FRAUD' },
    { user_id: 'user_1093', merchant_category: 'Crypto',      risk_score: 88, result: 'FRAUD' },
    { user_id: 'user_4821', merchant_category: 'Shopping',    risk_score: 18, result: 'SAFE' },
  ];

  txData.forEach((tx, i) => {
    if (!nodeSet.has(tx.user_id)) {
      nodes.push({ id: tx.user_id, type: 'user', risk: tx.risk_score, label: tx.user_id.replace('user_', 'U') });
      nodeSet.add(tx.user_id);
    }
    const merchantId = `merchant_${tx.merchant_category || 'Other'}`;
    const deviceId = `device_${['Mobile_A','Desktop_B','Mobile_C','Tablet_D','Unknown_E'][i % 5]}`;
    links.push({ source: tx.user_id, target: merchantId, value: tx.risk_score, fraud: tx.result === 'FRAUD' });
    links.push({ source: tx.user_id, target: deviceId,   value: tx.risk_score / 2, fraud: false });
  });

  return { nodes, links };
}

export default function NetworkGraph({ transactions = [], width = 600, height = 400 }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, links } = useMemo(() => buildGraphData(transactions), [transactions]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const w = svgRef.current.clientWidth || width;
    const h = height;

    // Defs — glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Simulation
    const sim = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(80).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius(20));

    // Links
    const link = svg.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke', (d: any) => d.fraud ? 'rgba(239,68,68,0.6)' : 'rgba(168,85,247,0.25)')
      .attr('stroke-width', (d: any) => d.fraud ? 2 : 1)
      .attr('stroke-dasharray', (d: any) => d.fraud ? '4,3' : 'none');

    // Node groups
    const node = svg.append('g').selectAll('g')
      .data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<any, any>()
        .on('start', (event, d: any) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (event, d: any) => { d.fx = event.x; d.fy = event.y; })
        .on('end',   (event, d: any) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Outer glow ring for fraud nodes
    node.filter((d: any) => d.risk > 60)
      .append('circle')
      .attr('r', (d: any) => typeRadius(d.type) + 5)
      .attr('fill', 'none')
      .attr('stroke', (d: any) => typeColor(d.type, d.risk))
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.4)
      .attr('filter', 'url(#glow)');

    // Main circle
    node.append('circle')
      .attr('r', (d: any) => typeRadius(d.type))
      .attr('fill', (d: any) => typeColor(d.type, d.risk))
      .attr('fill-opacity', 0.85)
      .attr('stroke', (d: any) => typeColor(d.type, d.risk))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('filter', (d: any) => d.risk > 60 ? 'url(#glow)' : 'none');

    // Labels
    node.append('text')
      .text((d: any) => d.label)
      .attr('dy', (d: any) => typeRadius(d.type) + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', '#9B8EC4')
      .attr('pointer-events', 'none');

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .style('position', 'fixed').style('pointer-events', 'none')
      .style('background', 'rgba(15,12,40,0.95)').style('border', '1px solid rgba(168,85,247,0.3)')
      .style('border-radius', '8px').style('padding', '8px 12px').style('font-size', '12px')
      .style('color', '#F0EEFF').style('z-index', '9999').style('opacity', '0').style('transition', 'opacity 0.2s');

    node.on('mouseover', (_event, d: any) => {
      tooltip.style('opacity', '1')
        .html(`<strong>${d.id}</strong><br/>Type: ${d.type}<br/>Risk: ${d.risk}`);
    }).on('mousemove', (event) => {
      tooltip.style('left', `${event.clientX + 12}px`).style('top', `${event.clientY - 28}px`);
    }).on('mouseout', () => tooltip.style('opacity', '0'));

    // Tick
    sim.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      sim.stop();
      tooltip.remove();
    };
  }, [nodes, links, width, height]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: `${height}px`, overflow: 'visible' }} />
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
        {[
          { color: '#A855F7', label: 'User (safe)' },
          { color: '#EF4444', label: 'User (fraud)' },
          { color: '#6366F1', label: 'Merchant' },
          { color: '#10B981', label: 'Device' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: '0.7rem', color: '#9B8EC4' }}>{l.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{ width: '16px', height: '2px', background: 'rgba(239,68,68,0.6)', borderTop: '2px dashed rgba(239,68,68,0.6)' }} />
          <span style={{ fontSize: '0.7rem', color: '#9B8EC4' }}>Fraud link</span>
        </div>
      </div>
    </div>
  );
}
