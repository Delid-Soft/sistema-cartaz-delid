const API_URL = '/api';
let empresaSelecionadaId = null;

async function apiRequest(endpoint, method='GET', body=null){
    const opts = { method, credentials:'include', headers:{} };
    if(body){ opts.headers['Content-Type']='application/json'; opts.body=JSON.stringify(body); }
    const resp = await fetch(API_URL+endpoint, opts);
    const data = await resp.json().catch(()=>({}));
    if(!resp.ok) throw new Error(data.error || 'Erro na requisição.');
    return data;
}

async function loginAdmin(){
    const username = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPass').value;
    const erro = document.getElementById('adminErro'); erro.innerText="";
    try{
        const data = await apiRequest('/auth/login','POST',{username,password});
        if(data.usuario.role !== 'super_admin'){ erro.innerText = "Este usuário não é administrador do sistema."; return; }
        document.getElementById('loginBox').style.display='none';
        document.getElementById('painelAdmin').style.display='block';
        carregarDashboard();
    }catch(e){ erro.innerText = e.message; }
}

async function logoutAdmin(){
    await apiRequest('/auth/logout','POST');
    location.reload();
}

async function carregarDashboard(){
    try{
        const resumo = await apiRequest('/admin/dashboard');
        document.getElementById('cardsResumo').innerHTML = `
            <div class="card"><div class="num">${resumo.totalEmpresas}</div><div class="lbl">Empresas Cadastradas</div></div>
            <div class="card"><div class="num">${resumo.totalAtivas}</div><div class="lbl">Empresas Ativas</div></div>
            <div class="card"><div class="num">${resumo.totalUsuarios}</div><div class="lbl">Usuários Totais</div></div>
            <div class="card"><div class="num">${resumo.porPlano.map(p=>p.plano+':'+p.qtd).join(' | ')}</div><div class="lbl">Por Plano</div></div>`;
        carregarEmpresas();
    }catch(e){ alert(e.message); }
}

async function carregarEmpresas(){
    try{
        const empresas = await apiRequest('/admin/empresas');
        const tbody = document.getElementById('corpoTabelaEmpresas');
        tbody.innerHTML = "";
        empresas.forEach(e=>{
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${e.nome}</b></td>
                <td>
                    <select class="plano-select" onchange="alterarPlano(${e.id}, this.value)">
                        <option value="trial" ${e.plano==='trial'?'selected':''}>Trial</option>
                        <option value="basico" ${e.plano==='basico'?'selected':''}>Básico</option>
                        <option value="pro" ${e.plano==='pro'?'selected':''}>Pro</option>
                        <option value="admin" ${e.plano==='admin'?'selected':''}>Admin</option>
                    </select>
                </td>
                <td>${e.total_usuarios}</td>
                <td>${e.data_expiracao ? new Date(e.data_expiracao).toLocaleDateString('pt-BR') : '-'}</td>
                <td><span class="badge ${e.ativo?'ativo':'inativo'}">${e.ativo?'Ativa':'Bloqueada'}</span></td>
                <td class="acoes">
                    ${e.ativo
                        ? `<button class="btn-bloquear" onclick="alterarStatus(${e.id}, false)">Bloquear</button>`
                        : `<button class="btn-ativar" onclick="alterarStatus(${e.id}, true)">Ativar</button>`}
                    <button class="btn-senha" onclick="abrirModalRedefinir(${e.id})">Redefinir senha</button>
                    <button class="btn-excluir" onclick="excluirEmpresa(${e.id})">Excluir</button>
                </td>`;
            tbody.appendChild(tr);
        });
    }catch(e){ alert(e.message); }
}

async function alterarStatus(id, ativo){
    try{ await apiRequest(`/admin/empresas/${id}/status`,'PUT',{ativo}); carregarEmpresas(); }
    catch(e){ alert(e.message); }
}

async function alterarPlano(id, plano){
    try{ await apiRequest(`/admin/empresas/${id}/plano`,'PUT',{plano}); }
    catch(e){ alert(e.message); }
}

async function excluirEmpresa(id){
    if(!confirm('Excluir esta empresa e TODOS os dados vinculados? Ação irreversível.')) return;
    try{ await apiRequest(`/admin/empresas/${id}`,'DELETE'); carregarEmpresas(); }
    catch(e){ alert(e.message); }
}

async function abrirModalRedefinir(empresaId){
    empresaSelecionadaId = empresaId;
    document.getElementById('erroRedefinir').innerText = "";
    document.getElementById('sucessoRedefinir').innerText = "";
    document.getElementById('novaSenhaRedefinir').value = "";
    try{
        const empresa = await apiRequest(`/admin/empresas/${empresaId}`);
        const select = document.getElementById('selectUsuarioRedefinir');
        select.innerHTML = empresa.usuarios.map(u => `<option value="${u.id}">${u.username} (${u.role})</option>`).join('');
        document.getElementById('overlayRedefinir').classList.add('aberto');
    }catch(e){ alert(e.message); }
}

function fecharModalRedefinir(){
    document.getElementById('overlayRedefinir').classList.remove('aberto');
}

async function confirmarRedefinirSenha(){
    const usuarioId = document.getElementById('selectUsuarioRedefinir').value;
    const novaSenha = document.getElementById('novaSenhaRedefinir').value;
    const erro = document.getElementById('erroRedefinir');
    const sucesso = document.getElementById('sucessoRedefinir');
    erro.innerText = ""; sucesso.innerText = "";
    if(!novaSenha || novaSenha.length < 8){ erro.innerText = "A senha deve ter no mínimo 8 caracteres."; return; }
    try{
        await apiRequest(`/admin/usuarios/${usuarioId}/senha`,'PUT',{novaSenha});
        sucesso.innerText = "Senha redefinida com sucesso!";
        setTimeout(fecharModalRedefinir, 1200);
    }catch(e){ erro.innerText = e.message; }
}

function abrirModalMinhaSenha(){
    document.getElementById('erroMinhaSenha').innerText = "";
    document.getElementById('sucessoMinhaSenha').innerText = "";
    document.getElementById('senhaAtualMinha').value = "";
    document.getElementById('novaSenhaMinha').value = "";
    document.getElementById('overlayMinhaSenha').classList.add('aberto');
}

function fecharModalMinhaSenha(){
    document.getElementById('overlayMinhaSenha').classList.remove('aberto');
}

async function confirmarMinhaSenha(){
    const senhaAtual = document.getElementById('senhaAtualMinha').value;
    const novaSenha = document.getElementById('novaSenhaMinha').value;
    const erro = document.getElementById('erroMinhaSenha');
    const sucesso = document.getElementById('sucessoMinhaSenha');
    erro.innerText = ""; sucesso.innerText = "";
    if(!novaSenha || novaSenha.length < 8){ erro.innerText = "A nova senha deve ter no mínimo 8 caracteres."; return; }
    try{
        await apiRequest('/auth/minha-senha','PUT',{senhaAtual, novaSenha});
        sucesso.innerText = "Senha alterada com sucesso!";
        setTimeout(fecharModalMinhaSenha, 1200);
    }catch(e){ erro.innerText = e.message; }
}

document.addEventListener('keydown', e => { if(e.key==='Enter' && document.getElementById('loginBox').style.display!=='none') loginAdmin(); });
