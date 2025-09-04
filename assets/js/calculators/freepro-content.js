// PASSO 12 - assets/js/calculators/freepro-content.js
// HTML completo da calculadora FreePro que roda no iframe

export function getFreeProfHTML() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Calculadora FreePro</title>
  <style>
    :root {
      --primary: #3b82f6;
      --secondary: #22c55e;
      --accent: #8b5cf6;
      --warning: #f59e0b;
      --danger: #dc2626;
      --success: #22c55e;
      --bg-primary: #111827;
      --bg-secondary: #1f2937;
      --bg-card: #374151;
      --text-primary: #f9fafb;
      --text-secondary: #d1d5db;
      --text-muted: #9ca3af;
      --border: #4b5563;
    }

    [data-theme="light"] {
      --bg-primary: #f8fafc;
      --bg-secondary: #f1f5f9;
      --bg-card: #ffffff;
      --text-primary: #1e293b;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --border: #e2e8f0;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    html, body {
      background: transparent;
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      padding: 1rem;
      margin: 0;
      overflow: visible;
      height: auto;
      transition: color 0.3s ease;
    }

    .calc-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .calc-logo {
    height: 64px !important;
    width: auto !important;
    margin-bottom: 0.75rem !important;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) !important;
    display: block !important;
    margin-left: auto !important;
    margin-right: auto !important;
    }

    .calc-title {
      font-size: 1.75rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .calc-subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .card {
      background: rgba(31, 41, 59, 0.8);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    [data-theme="light"] .card {
      background: rgba(255, 255, 255, 0.9);
    }

    .card-promo {
      border-left: 3px solid var(--primary);
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(31, 41, 59, 0.8));
    }

    [data-theme="light"] .card-promo {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(255, 255, 255, 0.9));
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }

    .card-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
    }

    .form-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .form-grid-auto { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }

    .form-group {
      margin-bottom: 0.75rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 0.375rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--border);
      border-radius: 8px;
      background: rgba(17, 24, 39, 0.8);
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    [data-theme="light"] .form-control {
      background: rgba(255, 255, 255, 0.9);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .coverage-grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .coverage-card {
      background: rgba(17, 24, 39, 0.6);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      border-left: 3px solid var(--primary);
      transition: background 0.3s ease;
    }

    [data-theme="light"] .coverage-card {
      background: rgba(255, 255, 255, 0.8);
    }

    .coverage-card:nth-child(1) { border-left-color: var(--success); }
    .coverage-card:nth-child(2) { border-left-color: var(--warning); }
    .coverage-card:nth-child(3) { border-left-color: var(--danger); }
    .coverage-card:nth-child(4) { border-left-color: var(--primary); }
    .coverage-card:nth-child(5) { border-left-color: var(--accent); }

    .coverage-title {
      font-weight: 700;
      font-size: 0.875rem;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .coverage-fields {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 0.75rem;
      align-items: end;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: 2px dashed var(--border);
      border-radius: 8px;
      cursor: pointer;
      min-height: 48px;
      transition: all 0.2s ease;
    }

    .checkbox-wrapper:hover {
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.05);
    }

    .total-display {
      text-align: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.05));
      border: 2px solid var(--primary);
      border-radius: 12px;
      margin: 1rem 0;
    }

    .total-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--primary);
      font-family: ui-monospace, monospace;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      font-size: 0.75rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
    }

    .btn-secondary {
      background: rgba(55, 65, 81, 0.8);
      color: var(--text-primary);
      border: 2px solid var(--border);
      transition: all 0.3s ease;
    }

    [data-theme="light"] .btn-secondary {
      background: rgba(255, 255, 255, 0.9);
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin: 1.5rem 0;
    }

    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-weight: 600;
      display: none;
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.1);
      border: 2px solid var(--warning);
      color: #fbbf24;
    }

    .results-table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(17, 24, 39, 0.8);
      border-radius: 12px;
      overflow: hidden;
      margin-top: 1rem;
      transition: background 0.3s ease;
    }

    [data-theme="light"] .results-table {
      background: rgba(255, 255, 255, 0.9);
    }

    .results-table th {
      background: rgba(17, 24, 39, 0.9);
      color: var(--text-primary);
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.75rem 0.5rem;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--primary);
      transition: background 0.3s ease;
    }

    [data-theme="light"] .results-table th {
      background: rgba(248, 250, 252, 0.9);
    }

    .results-table td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .results-table th:first-child,
    .results-table td:first-child { text-align: left; }

    .results-table th:not(:first-child),
    .results-table td:not(:first-child) { text-align: right; }

    .profit-positive { color: #22c55e !important; font-weight: 700 !important; }
    .profit-negative { color: #dc2626 !important; font-weight: 700 !important; }
    .profit-highlight { color: #3b82f6 !important; font-weight: 800 !important; }
    .text-small { font-size: 0.75rem; color: var(--text-muted); }

    @media (max-width: 900px) {
      .form-grid-3, .form-grid-auto { 
        grid-template-columns: 1fr; 
      }
      .coverage-fields { 
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="calc-header">
    <img src="assets/logo.png" alt="Shark 100% Green" class="calc-logo">
    <h1 class="calc-title">Calculadora Shark FreePro</h1>
    <p class="calc-subtitle">Otimize seus lucros com freebets de apostas seguras - estratégias para perder a qualificação e ganhar a freebet</p>
  </div>

  <div class="card">
    <div class="form-group">
      <label class="form-label" for="numEntradas">Número de Entradas</label>
      <select id="numEntradas" class="form-control">
        <option value="2">2 Mercados</option>
        <option value="3" selected>3 Mercados</option>
        <option value="4">4 Mercados</option>
        <option value="5">5 Mercados</option>
        <option value="6">6 Mercados</option>
      </select>
    </div>
  </div>

  <div class="card card-promo">
    <div class="card-header">
      <div class="card-title">Casa Promoção</div>
      <div class="badge">Shark Green</div>
    </div>
    <div class="form-grid form-grid-3">
      <div class="form-group">
        <label class="form-label" for="o1">Odd da Casa</label>
        <input id="o1" class="form-control" placeholder="ex: 3.00" inputmode="decimal" />
      </div>
      <div class="form-group">
        <label class="form-label" for="c1">Comissão (%)</label>
        <input id="c1" class="form-control" placeholder="ex: 0" inputmode="decimal" />
      </div>
      <div class="form-group">
        <label class="form-label" for="s1">Stake Qualificação</label>
        <input id="s1" class="form-control" placeholder="ex: 50" inputmode="decimal" />
      </div>
    </div>
    <div class="form-grid form-grid-3">
      <div class="form-group">
        <label class="form-label" for="F">Valor da Freebet</label>
        <input id="F" class="form-control" placeholder="ex: 50" inputmode="decimal" />
      </div>
      <div class="form-group">
        <label class="form-label" for="r">Taxa de Extração (%)</label>
        <input id="r" class="form-control" placeholder="ex: 70" inputmode="decimal" />
      </div>
      <div class="form-group">
        <label class="form-label" for="round_step">Arredondamento</label>
        <select id="round_step" class="form-control">
          <option value="0.01">R$ 0,01</option>
          <option value="0.10">R$ 0,10</option>
          <option value="0.50">R$ 0,50</option>
          <option value="1.00" selected>R$ 1,00</option>
        </select>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title">Coberturas</div>
    </div>
    <div id="oddsContainer" class="coverage-grid"></div>
  </div>

  <div class="total-display">
    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.375rem; text-transform: uppercase;">Stake Total</div>
    <div class="total-value" id="k_S">—</div>
  </div>

  <div class="actions">
    <button class="btn btn-primary" id="calcBtn">Calcular Estratégia</button>
    <button class="btn btn-secondary" id="clearBtn">Limpar Dados</button>
  </div>

  <div id="status" class="alert alert-warning"></div>

  <div class="card" id="results" style="display:none">
    <div class="card-header">
      <div class="card-title">Resultados Shark FreePro</div>
    </div>
    <div style="overflow-x:auto">
      <table class="results-table">
        <thead>
          <tr>
            <th>Cenário</th>
            <th>Odd</th>
            <th>Comissão</th>
            <th>Apostar</th>
            <th>Déficit</th>
            <th>Lucro Final</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>

<script>
'use strict';

// Sincronização de tema com parent
(() => {
  function syncTheme() {
    try {
      const parentTheme = parent.document.body.getAttribute('data-theme');
      if (parentTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
      } else {
        document.body.removeAttribute('data-theme');
      }
    } catch (e) {
      // Fallback se não conseguir acessar o parent
    }
  }
  
  syncTheme();
  
  try {
    const observer = new MutationObserver(syncTheme);
    observer.observe(parent.document.body, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
  } catch (e) {
    // Fallback se não conseguir observar o parent
  }
})();

(function(){
  function $(id){ return document.getElementById(id); }
  function nf(v){ return Number.isFinite(v) ? new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2}).format(v) : '—'; }
  function toNum(s){ 
    if(s===undefined||s===null) return NaN; 
    var str=String(s).trim(); 
    if(!str) return NaN; 
    if(str.indexOf(',')!==-1 && str.indexOf('.')!==-1) return parseFloat(str.replace(/\\./g,'').replace(',','.')); 
    if(str.indexOf(',')!==-1) return parseFloat(str.replace(',','.')); 
    return parseFloat(str); 
  }
  function showStatus(cls,msg){ 
    var el=$("status"); 
    el.className='alert alert-'+cls; 
    el.style.display='block'; 
    el.textContent=msg; 
  }
  function hideStatus(){ $("status").style.display='none'; }
  function effOdd(o,c){ 
    var cc=(Number.isFinite(c)&&c>0)?c/100:0; 
    return 1+(o-1)*(1-cc); 
  }

  function captureCoverageValues(){ 
    var nodes=document.querySelectorAll('#oddsContainer > div'); 
    var out=[]; 
    for(var i=0;i<nodes.length;i++){ 
      var odd=nodes[i].querySelector('input[data-type="odd"]'); 
      var com=nodes[i].querySelector('input[data-type="comm"]'); 
      var lay=nodes[i].querySelector('input[data-type="lay"]'); 
      out.push({odd:odd?odd.value:'', com:com?com.value:'', lay:lay?lay.checked:false}); 
    } 
    return out; 
  }

  function renderOddsInputs(){
    var n=parseInt($("numEntradas").value||'3',10);
    var prev=captureCoverageValues();
    var c=$("oddsContainer"); 
    c.innerHTML='';
    var blocks=Math.max(1,n-1);
    
    for(var i=0;i<blocks;i++){
      var card=document.createElement('div'); 
      card.className='coverage-card';
      
      var title=document.createElement('div'); 
      title.className='coverage-title'; 
      title.innerHTML='<span style="width:10px;height:10px;border-radius:50%;background:currentColor;display:inline-block"></span>Resultado '+(i+2);
      
      var fieldsDiv=document.createElement('div'); 
      fieldsDiv.className='coverage-fields';
      
      var fOdd=document.createElement('div'); 
      fOdd.className='form-group';
      fOdd.style.margin='0';
      var lOdd=document.createElement('label'); 
      lOdd.className='form-label';
      lOdd.textContent='Odd'; 
      var iOdd=document.createElement('input'); 
      iOdd.className='form-control';
      iOdd.setAttribute('inputmode','decimal'); 
      iOdd.placeholder='ex: 2,50'; 
      iOdd.setAttribute('data-type','odd');
      
      var fCom=document.createElement('div'); 
      fCom.className='form-group';
      fCom.style.margin='0';
      var lCom=document.createElement('label'); 
      lCom.className='form-label';
      lCom.textContent='Comissão (%)'; 
      var iCom=document.createElement('input'); 
      iCom.className='form-control';
      iCom.setAttribute('inputmode','decimal'); 
      iCom.placeholder='ex: 0'; 
      iCom.setAttribute('data-type','comm');
      
      var fLay=document.createElement('div'); 
      fLay.className='checkbox-wrapper'; 
      var iLay=document.createElement('input'); 
      iLay.type='checkbox'; 
      iLay.setAttribute('data-type','lay'); 
      var tLay=document.createElement('span'); 
      tLay.textContent='Lay';
      
      if(prev[i]){ 
        iOdd.value=prev[i].odd; 
        iCom.value=prev[i].com; 
        iLay.checked=!!prev[i].lay; 
      }
      
      fOdd.appendChild(lOdd); 
      fOdd.appendChild(iOdd);
      fCom.appendChild(lCom); 
      fCom.appendChild(iCom);
      fLay.appendChild(iLay); 
      fLay.appendChild(tLay);
      
      fieldsDiv.appendChild(fOdd); 
      fieldsDiv.appendChild(fCom); 
      fieldsDiv.appendChild(fLay);
      
      card.appendChild(title); 
      card.appendChild(fieldsDiv);
      c.appendChild(card);
    }
  }

  function readCoverage(){ 
    var odds=[],comm=[],isLay=[];
    var oInputs=document.querySelectorAll('#oddsContainer input[data-type="odd"]'); 
    var cInputs=document.querySelectorAll('#oddsContainer input[data-type="comm"]'); 
    var lInputs=document.querySelectorAll('#oddsContainer input[data-type="lay"]'); 
    
    for(var i=0;i<oInputs.length;i++){odds.push(toNum(oInputs[i].value));} 
    for(var j=0;j<cInputs.length;j++){comm.push(toNum(cInputs[j].value));} 
    for(var k=0;k<lInputs.length;k++){isLay.push(!!lInputs[k].checked);} 
    
    return {odds:odds,comm:comm,isLay:isLay}; 
  }

  function calc(){
    hideStatus();
    var o1=toNum($("o1").value), c1=toNum($("c1").value), n=parseInt($("numEntradas").value||'3',10), 
        cov=readCoverage(), F=toNum($("F").value), rPerc=toNum($("r").value), s1=toNum($("s1").value);
    
    if(!Number.isFinite(o1)||o1<=1){ showStatus('warning','Odd inválida para Casa Promo'); return }
    if(cov.odds.length!==(n-1)||cov.odds.some(v=>!Number.isFinite(v)||v<=1)){ showStatus('warning','Informe '+(n-1)+' odds válidas para coberturas'); return }
    if(!Number.isFinite(F)||F<0){ showStatus('warning','Valor da Freebet inválido'); return }
    if(!Number.isFinite(rPerc)||rPerc<0||rPerc>100){ showStatus('warning','Taxa de extração deve estar entre 0-100%'); return }
    if(!Number.isFinite(s1)||s1<=0){ showStatus('warning','Stake de qualificação inválido'); return }

    var o1e=effOdd(o1,c1), r=rPerc/100, rF=r*F;
    var A=s1*o1e - rF;

    var stakes=[],eBack=[],commFrac=[],oddsOrig=cov.odds.slice();
    
    for(var i=0;i<cov.odds.length;i++){
      var L=cov.odds[i], cfrac=(Number.isFinite(cov.comm[i])&&cov.comm[i]>0)?cov.comm[i]/100:0; 
      commFrac[i]=cfrac;
      
      if(cov.isLay[i]){ 
        var denom=L-1; 
        if(!(denom>0)){showStatus('warning','Odd LAY inválida'); return} 
        var eLay=1+(1-cfrac)/denom; 
        var equivStake=A/eLay; 
        stakes[i]=equivStake/denom; 
        eBack[i]=eLay; 
      } else { 
        var e=effOdd(L,cov.comm[i]); 
        eBack[i]=e; 
        stakes[i]=A/e; 
      }
    }

    var step=parseFloat($("round_step").value)||1; 
    function roundStep(v){return Math.round(v/step)*step;} 
    stakes=stakes.map(roundStep);
    
    var liabilities=stakes.map((s,i)=>cov.isLay[i]?(cov.odds[i]-1)*s:0);
    var S=s1+stakes.reduce((a,s,idx)=>a+(cov.isLay[idx]?(cov.odds[idx]-1)*s:s),0);

    var net1=s1*o1e-S;

    var defs=[], nets=[];
    for(var win=0;win<stakes.length;win++){
      var deficit;
      if(cov.isLay[win]){ 
        var ganhoLay=stakes[win]*(1-commFrac[win]); 
        var liab=liabilities[win]; 
        deficit=ganhoLay-(S-liab); 
      } else { 
        deficit=(stakes[win]*eBack[win]) - S; 
      }
      defs[win]=deficit;
      nets[win]=deficit + rF;
    }

    $("k_S").textContent=nf(S);

    var tb=$("tbody"); 
    tb.innerHTML='';
    
    function oddf(v){return Number.isFinite(v)?new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v):'—';}
    function pf(v){return Number.isFinite(v)?new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v)+'%':'—';}

    var rows=[[ '1 vence (Casa Promo)', o1, c1, s1, net1, net1, false, 0, '' ]];
    for(var k=0;k<stakes.length;k++){
      var isLay=cov.isLay[k]; 
      var liab=liabilities[k];
      rows.push([ (k+2)+' vence', oddsOrig[k], cov.comm[k], stakes[k], defs[k], nets[k], isLay, liab, '' ]);
    }

    for(var rix=0; rix<rows.length; rix++){
      var nome=rows[rix][0], odd=rows[rix][1], comm=rows[rix][2], stake=rows[rix][3], 
          deficit=rows[rix][4], final=rows[rix][5], isLayRow=rows[rix][6], liabRow=rows[rix][7];
      var apostarCell = '<strong>'+nf(stake)+'</strong>' + (isLayRow ? (' <span class="text-small">(resp. '+nf(liabRow)+')</span>') : '');
      var deficitClass = deficit >= 0 ? 'profit-positive' : 'profit-negative';
      var finalClass = final >= 0 ? 'profit-positive' : 'profit-negative';
      
      var tr=document.createElement('tr');
      tr.innerHTML = '<td><strong>'+nome+'</strong></td>'+
                     '<td>'+oddf(odd)+'</td>'+
                     '<td>'+pf(comm)+'</td>'+
                     '<td>'+apostarCell+'</td>'+
                     '<td class="'+deficitClass+'"><strong>'+nf(deficit)+'</strong></td>'+
                     '<td class="'+finalClass+'"><strong>'+nf(final)+'</strong></td>';
      tb.appendChild(tr);
    }
    $("results").style.display='block';
  }

  $("numEntradas").addEventListener('change', renderOddsInputs);
  $("calcBtn").addEventListener('click', calc);
  $("clearBtn").addEventListener('click', function(){ 
    ["o1","c1","F","r","s1"].forEach(id=>$(id).value=''); 
    $("tbody").innerHTML=''; 
    $("results").style.display='none'; 
    $("k_S").textContent='—'; 
    hideStatus(); 
    renderOddsInputs(); 
  });

  window.addEventListener('DOMContentLoaded', function(){
    renderOddsInputs();
  });
})();
</script>
</body>
</html>`;
}
