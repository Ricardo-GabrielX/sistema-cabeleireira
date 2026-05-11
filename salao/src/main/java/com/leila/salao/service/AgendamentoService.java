package com.leila.salao.service;

import com.leila.salao.dto.AgendamentoDTO;
import com.leila.salao.dto.DashboardDTO;
import com.leila.salao.dto.ServicoDTO;
import com.leila.salao.model.*;
import com.leila.salao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;

    // --- CLIENTE ---

    public AgendamentoDTO.Response criar(AgendamentoDTO.Request req, UUID clienteId) {
        Usuario cliente = usuarioRepository.findById(clienteId)
            .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        if (!horarioEstaDisponivel(req.getDataHora())) {
            throw new RuntimeException("Este horário já está ocupado. Por favor, escolha outro horário.");
        }

        List<Servico> servicos = servicoRepository.findAllById(req.getServicoIds());
        if (servicos.isEmpty()) throw new RuntimeException("Nenhum serviço válido informado");

        Agendamento agendamento = Agendamento.builder()
            .cliente(cliente)
            .dataHora(req.getDataHora())
            .servicos(servicos)
            .observacao(req.getObservacao())
            .build();

        agendamentoRepository.save(agendamento);

        String sugestao = verificarMesmaSemana(clienteId, req.getDataHora(), agendamento.getId());
        return toResponse(agendamento, sugestao);
    }

    private boolean horarioEstaDisponivel(LocalDateTime dataHora) {
        LocalDate data = dataHora.toLocalDate();
        LocalTime horario = dataHora.toLocalTime();
        
        long conflitos = agendamentoRepository
            .findByDataHoraBetweenOrderByDataHoraAsc(
                data.atStartOfDay(),
                data.atTime(23, 59)
            )
            .stream()
            .filter(a -> a.getStatus() != AgendamentoStatus.CANCELADO)
            .filter(a -> a.getDataHora().toLocalTime().equals(horario))
            .count();
        
        return conflitos == 0;
    }

    public AgendamentoDTO.Response atualizarComoCliente(UUID id, AgendamentoDTO.Request req, UUID clienteId) {
        Agendamento agendamento = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (!agendamento.getCliente().getId().equals(clienteId))
            throw new RuntimeException("Sem permissão para alterar este agendamento");

        if (!podeAlterar(agendamento.getDataHora()))
            throw new RuntimeException("Alteração online não permitida. Ligue para o salão.");

        agendamento.setDataHora(req.getDataHora());
        agendamento.setObservacao(req.getObservacao());
        agendamento.setServicos(servicoRepository.findAllById(req.getServicoIds()));
        return toResponse(agendamentoRepository.save(agendamento), null);
    }

    public List<AgendamentoDTO.Response> listarDoCliente(UUID clienteId) {
        return agendamentoRepository.findByClienteIdOrderByDataHoraDesc(clienteId)
            .stream().map(a -> toResponse(a, null)).toList();
    }

    // --- CABELEIREIRA ---

    public AgendamentoDTO.Response atualizarComoCabeleireira(UUID id, AgendamentoDTO.Request req) {
        Agendamento agendamento = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        agendamento.setDataHora(req.getDataHora());
        agendamento.setObservacao(req.getObservacao());
        agendamento.setServicos(servicoRepository.findAllById(req.getServicoIds()));
        return toResponse(agendamentoRepository.save(agendamento), null);
    }

    public AgendamentoDTO.Response alterarStatus(UUID id, AgendamentoStatus novoStatus) {
        Agendamento agendamento = agendamentoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
        agendamento.setStatus(novoStatus);
        return toResponse(agendamentoRepository.save(agendamento), null);
    }

    public List<AgendamentoDTO.Response> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        return agendamentoRepository
            .findByDataHoraBetweenOrderByDataHoraAsc(
                inicio.atStartOfDay(), fim.atTime(23, 59))
            .stream().map(a -> toResponse(a, null)).toList();
    }

    // --- DASHBOARD ---

    public DashboardDTO.SemanaResponse dashboardSemana() {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioSemana = hoje.with(DayOfWeek.MONDAY);
        LocalDate fimSemana = hoje.with(DayOfWeek.SUNDAY);

        List<Agendamento> agendamentos = agendamentoRepository
            .findByDataHoraBetweenOrderByDataHoraAsc(
                inicioSemana.atStartOfDay(), fimSemana.atTime(23, 59));

        // Agrupamento por dia para o gráfico
        Map<String, Long> porDia = new LinkedHashMap<>();
        for (DayOfWeek dia : DayOfWeek.values()) {
            String nomeDia = dia.getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"));
            long count = agendamentos.stream()
                .filter(a -> a.getDataHora().getDayOfWeek() == dia)
                .count();
            porDia.put(nomeDia, count);
        }

        // Sugestões de consolidação (mesmo cliente, 2+ agendamentos na semana)
        Map<UUID, List<Agendamento>> porCliente = agendamentos.stream()
            .collect(Collectors.groupingBy(a -> a.getCliente().getId()));

        List<DashboardDTO.SugestaoConsolidacao> sugestoes = porCliente.values().stream()
            .filter(lista -> lista.size() > 1)
            .map(lista -> {
                lista.sort(Comparator.comparing(Agendamento::getDataHora));
                return DashboardDTO.SugestaoConsolidacao.builder()
                    .clienteNome(lista.get(0).getCliente().getNome())
                    .clienteTelefone(lista.get(0).getCliente().getTelefone())
                    .sugestaoData(lista.get(0).getDataHora()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .agendamentos(lista.stream().map(a -> toResponse(a, null)).toList())
                    .build();
            }).toList();

        return DashboardDTO.SemanaResponse.builder()
            .totalSemana(agendamentos.size())
            .confirmados(agendamentos.stream().filter(a -> a.getStatus() == AgendamentoStatus.CONFIRMADO).count())
            .pendentes(agendamentos.stream().filter(a -> a.getStatus() == AgendamentoStatus.PENDENTE).count())
            .cancelados(agendamentos.stream().filter(a -> a.getStatus() == AgendamentoStatus.CANCELADO).count())
            .agendamentosPorDia(porDia)
            .sugestoes(sugestoes)
            .build();
    }

    // --- REGRAS DE NEGÓCIO ---

    private boolean podeAlterar(LocalDateTime dataHora) {
        return LocalDateTime.now().plusDays(2).isBefore(dataHora);
    }

    private String verificarMesmaSemana(UUID clienteId, LocalDateTime dataHora, UUID agendamentoAtualId) {
        LocalDate data = dataHora.toLocalDate();
        LocalDate inicioSemana = data.with(DayOfWeek.MONDAY);
        LocalDate fimSemana = data.with(DayOfWeek.SUNDAY);

        return agendamentoRepository
            .findByClienteIdAndDataHoraBetween(clienteId, inicioSemana.atStartOfDay(), fimSemana.atTime(23, 59))
            .stream()
            .filter(a -> !a.getId().equals(agendamentoAtualId))
            .findFirst()
            .map(a -> "Você já tem agendamento em " +
                a.getDataHora().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm")) +
                ". Deseja agendar na mesma data?")
            .orElse(null);
    }

    public List<String> horariosDisponiveis(LocalDate data) {
        List<String> todosHorarios = gerarHorariosFuncionamento();
        
        // Busca agendamentos confirmados e pendentes para o dia
        List<Agendamento> agendamentosDoDia = agendamentoRepository
            .findByDataHoraBetweenOrderByDataHoraAsc(
                data.atStartOfDay(),
                data.atTime(23, 59)
            )
            .stream()
            .filter(a -> a.getStatus() != AgendamentoStatus.CANCELADO)
            .toList();
        
        // Monta lista de horários ocupados
        Set<String> horariosOcupados = agendamentosDoDia.stream()
            .map(a -> a.getDataHora().toLocalTime().toString().substring(0, 5))
            .collect(Collectors.toSet());
        
        // Retorna todos com indicação de disponibilidade
        return todosHorarios.stream()
            .map(h -> horariosOcupados.contains(h) ? h + ":OCUPADO" : h + ":DISPONIVEL")
            .toList();
    }

    private List<String> gerarHorariosFuncionamento() {
        List<String> horarios = new ArrayList<>();
        LocalTime inicio = LocalTime.of(8, 0);
        LocalTime fim = LocalTime.of(18, 0);
        
        while (!inicio.isAfter(fim)) {
            horarios.add(inicio.format(DateTimeFormatter.ofPattern("HH:mm")));
            inicio = inicio.plusMinutes(30);
        }
        
        return horarios;
    }
    

    // --- MAPPER ---

    private AgendamentoDTO.Response toResponse(Agendamento a, String sugestao) {
        return AgendamentoDTO.Response.builder()
            .id(a.getId())
            .clienteNome(a.getCliente().getNome())
            .clienteTelefone(a.getCliente().getTelefone())
            .dataHora(a.getDataHora())
            .status(a.getStatus())
            .servicos(a.getServicos().stream().map(s -> ServicoDTO.Response.builder()
                .id(s.getId()).nome(s.getNome())
                .duracaoMinutos(s.getDuracaoMinutos()).preco(s.getPreco())
                .build()).toList())
            .observacao(a.getObservacao())
            .criadoEm(a.getCriadoEm())
            .sugestao(sugestao)
            .build();
    }
}