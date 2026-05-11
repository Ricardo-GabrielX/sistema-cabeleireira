package com.leila.salao.service;

import com.leila.salao.dto.ServicoDTO;
import com.leila.salao.model.Servico;
import com.leila.salao.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoDTO.Response criar(ServicoDTO.Request req) {
        Servico servico = Servico.builder()
            .nome(req.getNome())
            .descricao(req.getDescricao())
            .duracaoMinutos(req.getDuracaoMinutos())
            .preco(req.getPreco())
            .build();
        return toResponse(servicoRepository.save(servico));
    }

    public List<ServicoDTO.Response> listarTodos() {
        return servicoRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ServicoDTO.Response atualizar(UUID id, ServicoDTO.Request req) {
        Servico servico = servicoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
        servico.setNome(req.getNome());
        servico.setDescricao(req.getDescricao());
        servico.setDuracaoMinutos(req.getDuracaoMinutos());
        servico.setPreco(req.getPreco());
        return toResponse(servicoRepository.save(servico));
    }

    public void deletar(UUID id) {
        servicoRepository.deleteById(id);
    }

    private ServicoDTO.Response toResponse(Servico s) {
        return ServicoDTO.Response.builder()
            .id(s.getId())
            .nome(s.getNome())
            .descricao(s.getDescricao())
            .duracaoMinutos(s.getDuracaoMinutos())
            .preco(s.getPreco())
            .build();
    }
}