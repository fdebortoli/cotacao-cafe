import { create } from 'rung-sdk';
import { OneOf, Double } from 'rung-sdk/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import { path, lt, gt, pipe, cond, equals, contains, __, T, concat } from 'ramda';
import { JSDOM } from 'jsdom';

const request = promisifyAgent(agent, Bluebird);

function render(card_titulo, col1_tit, col1_val, col2_tit, col2_val) {

    return (
		<div style="width:165px; height:125px; box-sizing: border-box; padding: 1px; overflow: hidden; position: absolute; margin: -12px 0 0 -10px; ">

			<div style="width:100%; height:20px; background-color: rgba(255,255,255,0.5); position: relative; z-index:1; ">
				<div style="background: url('http://www.pbanimado.com.br/rung/icon-cafe.png') no-repeat center center; background-size: 100%; width:50px; height: 50px; position: absolute; z-index:2; margin: -10px 0 0 54px; border: 3px solid #FFF; -webkit-border-radius: 50%; -moz-border-radius: 50%; border-radius: 50%;"></div>
			</div>

			<div style="font-size:11px; width:96%; line-height: 1.3; text-align: center; padding: 30px 2% 0; ">
				<p style="margin:0; padding: 0; ">{card_titulo}</p>
				<p style="margin:0; padding: 0; ">{col1_tit}: {col1_val}</p>
				<p style="margin:0; padding: 0; ">{col2_tit}: <strong style="text-decoration: underline; ">{col2_val}</strong></p>
			</div>
		</div>
	);


}

function nodeListToArray(dom) {
    return Array.prototype.slice.call(dom, 0);
}

function returnSelector(type, row, cell) {
	const selector = '#content .middle .tables .cotacao:nth-child(1) .table-content table ';
	const selectorTable = type == 'title'
		? `thead > tr > th:nth-child(${cell})`
		: `tbody > tr:nth-child(${row}) > td:nth-child(${cell})`;
	return selector + selectorTable;
}

function main(context, done) {

	const { fonte, condicao, valor } = context.params;

	// variáveis padrão
	var fonte_titulo = '';
	var fonte_link = 'https://www.noticiasagricolas.com.br/cotacoes/cafe/';
	var fonte_data = '#content .middle .tables .cotacao:nth-child(1) .info .fechamento';

	// variáveis das colunas de busca
	var coluna1_titulo = returnSelector('title', '', '1');
	var coluna1_result = returnSelector('result', '1', '1');

	var coluna2_titulo = returnSelector('title', '', '2');
	var coluna2_result = returnSelector('result', '1', '2');

	var coluna3_titulo = returnSelector('title', '', '3');
	var coluna3_result = returnSelector('result', '1', '3');

	// definindo os valores padrão de exibição
	var fonte_coluna_tit 	= coluna1_titulo;
	var fonte_coluna_res 	= coluna1_result;

	var fonte_preco_tit 	= coluna2_titulo;
	var fonte_preco_res 	= coluna2_result;

	var fonte_variacao_tit 	= coluna3_titulo;
	var fonte_variacao_res 	= coluna3_result;

	// definindo o link de conexão
	const server = pipe(
		cond([

			[equals('Bolsa de Londres (Ice Futures Europe)'), () => 'cafe-bolsa-de-londres-liffe'],

			[equals('Bolsa de Nova Iorque (NYBOT)'), () => 'cafe-bolsa-de-nova-iorque-nybot'],

			[contains(__, ['Arábica Tipo 4/5 - Poços de Caldas/MG', 'Arábica Tipo 4/5 - Franca/SP', 'Arábica Tipo 4/5 - Varginha/MG']), () => 'cafe-arabica-mercado-fisico-tipo-45'],

			[contains(__, ['Arábica Tipo 6 duro - Guaxupé/MG', 'Arábica Tipo 6 duro - Poços de Caldas/MG', 'Arábica Tipo 6 duro - Patrocínio/MG', 'Arábica Tipo 6 duro - Esp. Sto. do Pinhal/SP', 'Arábica Tipo 6 duro - Franca/SP', 'Arábica Tipo 6 duro - Vitória/ES', 'Arábica Tipo 6 duro - Maringá/PR', 'Arábica Tipo 6 duro - Araguarí/MG', 'Arábica Tipo 6 duro - Varginha/MG', 'Arábica Tipo 6 duro - Oeste da Bahia', 'Arábica Tipo 6 duro - Média Rio Grande do Sul']), () => 'cafe-arabica-mercado-fisico-tipo-6-duro'],

			[equals('Café Arábica 4/5 - BM&F (Pregão Regular)'), () => 'cafe-arabica-bmf-pregao-regular'],

			[contains(__, ['Café Cereja Descascado - Guaxupé/MG', 'Café Cereja Descascado - Poços de Caldas/MG', 'Café Cereja Descascado - Patrocínio/MG', 'Café Cereja Descascado - Esp. Sto. do Pinhal/SP', 'Café Cereja Descascado - Franca/SP', 'Café Cereja Descascado - Varginha/MG']), () => 'cafe-cereja-descascado-mercado-fisico'],

			[contains(__, ['Café Conilon Tipo 7 - Centro do Comércio de Café de Vitória', 'Café Conilon Tipo 8 - Centro do Comércio de Café de Vitória', 'Café Conilon Tipo 7 - Coop. Agr. Cafeic. de São Gabriel', 'Café Conilon Tipo 8 - Coop. Agr. Cafeic. de São Gabriel', 'Café Conilon Tipo 7 - Cariacica']), () => 'cafe-conillon-disponivel-vitoria-es'],

			[equals('Indicador Café Arábica - Cepea/Esalq'), () => 'indicador-cepea-esalq-cafe-arabica'],

			[equals('Indicador Café Robusta - Cepea/Esalq'), () => 'indicador-cepea-esalq-cafe-conillon'],

			[T, () => '']
		]),
		concat(fonte_link)
	)(fonte);

	// definindo os valores padrão
	switch (fonte) {

		case 'Bolsa de Londres (Ice Futures Europe)':
			fonte_titulo		= 'Bolsa de Londres (Ice Futures Europe)';
			break;

		case 'Bolsa de Nova Iorque (NYBOT)':
			fonte_titulo		= 'Bolsa de Nova Iorque (NYBOT)';
			fonte_preco_tit 	= returnSelector('title', '1', '3');
			fonte_preco_res 	= returnSelector('result', '1', '3');
			fonte_variacao_tit 	= returnSelector('title', '1', '4');
			fonte_variacao_res 	= returnSelector('result', '1', '4');
			break;

		case 'Arábica Tipo 4/5 - Poços de Caldas/MG':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 4/5)';
    		break;

		case 'Arábica Tipo 4/5 - Franca/SP':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 4/5)';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

		case 'Arábica Tipo 4/5 - Varginha/MG':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 4/5)';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
    		break;

		case 'Arábica Tipo 6 duro - Guaxupé/MG':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
    		break;

		case 'Arábica Tipo 6 duro - Poços de Caldas/MG':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

		case 'Arábica Tipo 6 duro - Patrocínio/MG':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
    		break;

		case 'Arábica Tipo 6 duro - Esp. Sto. do Pinhal/SP':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
    		break;

		case 'Arábica Tipo 6 duro - Franca/SP':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
    		break;

		case 'Arábica Tipo 6 duro - Vitória/ES':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
    		break;

		case 'Arábica Tipo 6 duro - Maringá/PR':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
    		break;

		case 'Arábica Tipo 6 duro - Araguarí/MG':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
    		break;

		case 'Arábica Tipo 6 duro - Varginha/MG':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '9', '1');
			fonte_preco_res 	= returnSelector('result', '9', '2');
			fonte_variacao_res 	= returnSelector('result', '9', '3');
    		break;

		case 'Arábica Tipo 6 duro - Oeste da Bahia':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '10', '1');
			fonte_preco_res 	= returnSelector('result', '10', '2');
			fonte_variacao_res 	= returnSelector('result', '10', '3');
    		break;

		case 'Arábica Tipo 6 duro - Média Rio Grande do Sul':
			fonte_titulo		= 'Café Arábica - Mercado Físico (Tipo 6 duro)';
			fonte_coluna_res 	= returnSelector('result', '11', '1');
			fonte_preco_res 	= returnSelector('result', '11', '2');
			fonte_variacao_res 	= returnSelector('result', '11', '3');
    		break;

		case 'Café Arábica 4/5 - BM&F (Pregão Regular)':
			fonte_titulo		= 'Café Arábica 4/5 - BM&F (Pregão Regular)';
			break;

		case 'Café Cereja Descascado - Guaxupé/MG':
			fonte_titulo		= 'Café Cereja Descascado - Mercado Físico';
    		break;

		case 'Café Cereja Descascado - Poços de Caldas/MG':
			fonte_titulo		= 'Café Cereja Descascado - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

		case 'Café Cereja Descascado - Patrocínio/MG':
			fonte_titulo		= 'Café Cereja Descascado - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
    		break;

		case 'Café Cereja Descascado - Esp. Sto. do Pinhal/SP':
			fonte_titulo		= 'Café Cereja Descascado - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
    		break;

		case 'Café Cereja Descascado - Franca/SP':
			fonte_titulo		= 'Café Cereja Descascado - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
    		break;

		case 'Café Cereja Descascado - Varginha/MG':
			fonte_titulo		= 'Café Cereja Descascado - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
    		break;

		case 'Café Conilon Tipo 7 - Centro do Comércio de Café de Vitória':
			fonte_titulo		= 'Café Conilon - Disponível (Espírito Santo)';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
    		break;

		case 'Café Conilon Tipo 8 - Centro do Comércio de Café de Vitória':
			fonte_titulo		= 'Café Conilon - Disponível (Espírito Santo)';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
    		break;

		case 'Café Conilon Tipo 7 - Coop. Agr. Cafeic. de São Gabriel':
			fonte_titulo		= 'Café Conilon - Disponível (Espírito Santo)';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
    		break;

		case 'Café Conilon Tipo 8 - Coop. Agr. Cafeic. de São Gabriel':
			fonte_titulo		= 'Café Conilon - Disponível (Espírito Santo)';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
    		break;

		case 'Café Conilon Tipo 7 - Cariacica':
			fonte_titulo		= 'Café Conilon - Disponível (Espírito Santo)';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
    		break;

		case 'Indicador Café Arábica - Cepea/Esalq':
			fonte_titulo		= 'Indicador Café Arábica - Cepea/Esalq';
			break;

		case 'Indicador Café Robusta - Cepea/Esalq':
			fonte_titulo		= 'Indicador Café Robusta - Cepea/Esalq';
			break;

	}

	// Obter todo o HTML do site em modo texto
	return request.get(server).then(({ text }) => {

		// Virtualizar o DOM do texto
		const { window } = new JSDOM(text);

		// Converter os dados da tabela para uma lista
		const retorno_data 			= window.document.querySelector(fonte_data).innerHTML;
		const retorno_coluna_tit 	= window.document.querySelector(fonte_coluna_tit).innerHTML;
		const retorno_coluna_res 	= window.document.querySelector(fonte_coluna_res).innerHTML;
		const retorno_preco_tit 	= window.document.querySelector(fonte_preco_tit).innerHTML;
		const retorno_preco_res 	= window.document.querySelector(fonte_preco_res).innerHTML;
		const retorno_variacao_tit 	= window.document.querySelector(fonte_variacao_tit).innerHTML;
		const retorno_variacao_res 	= window.document.querySelector(fonte_variacao_res).innerHTML;

		// arrumando o valor que vem do HTML
		var valorHTML = parseFloat(retorno_preco_res.replace(',', '.'));

		// arrumando o valor que é digitado
		var valorFormatado = valor.toFixed(2);

		// formatando comentario
		var comentario = "<p style='font-weight: bold; font-size: 18px; '>Cotação do Café</p><p style='font-weight: bold; font-size: 18px; '>" + fonte_titulo + "</p><hr><p style='font-size: 16px; font-weight: bold; '>" + retorno_data + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_coluna_tit + "</span>: " + retorno_coluna_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_preco_tit + "</span>: " + retorno_preco_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_variacao_tit + "</span>: " + retorno_variacao_res + "</p><br><p style='font-size: 16px; '>Fonte: Portal Notícias Agrícolas</p><a href='" + server + "' target='_blank' style='font-size: 14px; font-style: italic; '>http://www.noticiasagricolas.com.br</a>";

		console.log(comentario);

		// verificação de maior OU menor
		if ((condicao == 'maior' && valorHTML > valor) || (condicao == 'menor' && valorHTML < valor)) {

			done({
				alerts: {
					[`cafe${fonte_titulo}`] : {
						title: fonte_titulo,
						content: render(fonte_titulo, retorno_coluna_tit, retorno_coluna_res, retorno_preco_tit, retorno_preco_res),
						comment: comentario
					}
				}
			});

		} else {

			done({ alerts: {} });

		}
	})
	.catch(() => done({ alerts: {} }));

}

const lista_fontes = [

	'Bolsa de Londres (Ice Futures Europe)',
	'Bolsa de Nova Iorque (NYBOT)',
	'Arábica Tipo 4/5 - Poços de Caldas/MG',
	'Arábica Tipo 4/5 - Franca/SP',
	'Arábica Tipo 4/5 - Varginha/MG',
	'Arábica Tipo 6 duro - Guaxupé/MG',
	'Arábica Tipo 6 duro - Poços de Caldas/MG',
	'Arábica Tipo 6 duro - Patrocínio/MG',
	'Arábica Tipo 6 duro - Esp. Sto. do Pinhal/SP',
	'Arábica Tipo 6 duro - Franca/SP',
	'Arábica Tipo 6 duro - Vitória/ES',
	'Arábica Tipo 6 duro - Maringá/PR',
	'Arábica Tipo 6 duro - Araguarí/MG',
	'Arábica Tipo 6 duro - Varginha/MG',
	'Arábica Tipo 6 duro - Oeste da Bahia',
	'Arábica Tipo 6 duro - Média Rio Grande do Sul',
	'Café Arábica 4/5 - BM&F (Pregão Regular)',
	'Café Cereja Descascado - Guaxupé/MG',
	'Café Cereja Descascado - Poços de Caldas/MG',
	'Café Cereja Descascado - Patrocínio/MG',
	'Café Cereja Descascado - Esp. Sto. do Pinhal/SP',
	'Café Cereja Descascado - Franca/SP',
	'Café Cereja Descascado - Varginha/MG',
	'Café Conilon Tipo 7 - Centro do Comércio de Café de Vitória',
	'Café Conilon Tipo 8 - Centro do Comércio de Café de Vitória',
	'Café Conilon Tipo 7 - Coop. Agr. Cafeic. de São Gabriel',
	'Café Conilon Tipo 8 - Coop. Agr. Cafeic. de São Gabriel',
	'Café Conilon Tipo 7 - Cariacica',
	'Indicador Café Arábica - Cepea/Esalq',
	'Indicador Café Robusta - Cepea/Esalq'

];

const params = {
    fonte: {
        description: _('Informe a fonte que você deseja ser informado: '),
        type: OneOf(lista_fontes),
		required: true
    },
	condicao: {
		description: _('Informe a condição (maior, menor): '),
		type: OneOf(['maior', 'menor']),
		default: 'maior'
	},
	valor: {
		description: _('Informe o valor em reais para verificação: '),
		type: Double,
		required: true
	}
};

export default create(main, {
    params,
    primaryKey: true,
    title: _("Cotação Café"),
    description: _("Acompanhe a cotação do café em diversas praças."),
	preview: render('Café Arábica - Mercado Físico (Tipo 6 duro)', 'Município', 'Oeste da Bahia (AIBA)', 'Preço - R$/saca 60kg', '450,00')
});