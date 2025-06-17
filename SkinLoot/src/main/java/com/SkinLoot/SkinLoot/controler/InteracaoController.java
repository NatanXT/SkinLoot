@RestController
@RequestMapping("/interacoes")
public class InteracaoController {

    @Autowired
    private InteracaoUsuarioSkinRepository interacaoRepo;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private SkinService skinService;

    @PostMapping("/registrar")
    public ResponseEntity<Void> registrar(@RequestBody InteracaoRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Skin skin = skinService.buscarPorId(request.getSkinId())
                .orElseThrow(() -> new RuntimeException("Skin não encontrada"));

        InteracaoUsuarioSkin i = new InteracaoUsuarioSkin();
        i.setUsuario(usuario);
        i.setSkin(skin);
        i.setTipo(request.getTipo());
        i.setTempoVisualizacao(request.getTempo());
        i.setDataHora(LocalDateTime.now());

        interacaoRepo.save(i);
        return ResponseEntity.ok().build();
    }
}
