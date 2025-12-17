import { useState, useMemo } from "react";
import { useCasasArbbet, CasaArbbet } from "@/hooks/useCasasArbbet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Database, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
export const CasasArbbetList = () => {
  const {
    data: casas,
    isLoading,
    error,
    refetch
  } = useCasasArbbet();
  const [search, setSearch] = useState("");
  const [grupoFilter, setGrupoFilter] = useState("todos");
  const [paFilter, setPaFilter] = useState("todos");
  const [kycFilter, setKycFilter] = useState("todos");

  // Get unique values for filters
  const grupos = useMemo(() => {
    if (!casas) return [];
    return [...new Set(casas.map(c => c.grupo).filter(Boolean))].sort();
  }, [casas]);
  const kycs = useMemo(() => {
    if (!casas) return [];
    return [...new Set(casas.map(c => c.kyc).filter(Boolean))].sort();
  }, [casas]);

  // Filter casas
  const filteredCasas = useMemo(() => {
    if (!casas) return [];
    return casas.filter(casa => {
      const matchesSearch = !search || casa.casa.toLowerCase().includes(search.toLowerCase()) || casa.empresa.toLowerCase().includes(search.toLowerCase());
      const matchesGrupo = grupoFilter === "todos" || casa.grupo === grupoFilter;
      const matchesPa = paFilter === "todos" || paFilter === "sim" && casa.pa || paFilter === "nao" && !casa.pa;
      const matchesKyc = kycFilter === "todos" || casa.kyc === kycFilter;
      return matchesSearch && matchesGrupo && matchesPa && matchesKyc;
    });
  }, [casas, search, grupoFilter, paFilter, kycFilter]);
  if (error) {
    return <Card className="bg-destructive/10 border-destructive/30">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
          <button onClick={() => refetch()} className="mt-4 text-primary underline">
            Tentar novamente
          </button>
        </CardContent>
      </Card>;
  }
  return <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Informações das Casas</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isLoading ? <Badge variant="secondary" className="animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Carregando...
              </Badge> : <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {casas?.length || 0} casas carregadas
              </Badge>}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-2">
      </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar casa ou empresa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Select value={grupoFilter} onValueChange={setGrupoFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Grupos</SelectItem>
              {grupos.map(grupo => <SelectItem key={grupo} value={grupo}>
                  {grupo}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={paFilter} onValueChange={setPaFilter}>
            <SelectTrigger>
              <SelectValue placeholder="PA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">PA: Todos</SelectItem>
              <SelectItem value="sim">PA: Sim</SelectItem>
              <SelectItem value="nao">PA: Não</SelectItem>
            </SelectContent>
          </Select>

          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger>
              <SelectValue placeholder="KYC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos KYC</SelectItem>
              {kycs.map(kyc => <SelectItem key={kyc} value={kyc}>
                  {kyc}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {!isLoading && <p className="text-sm text-muted-foreground">
            Mostrando {filteredCasas.length} de {casas?.length || 0} casas
          </p>}

        {/* Table */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="font-bold">Grupo</TableHead>
                  <TableHead className="font-bold">Casa</TableHead>
                  <TableHead className="font-bold text-center">PA</TableHead>
                  <TableHead className="font-bold">PIX</TableHead>
                  <TableHead className="font-bold">Estat</TableHead>
                  <TableHead className="font-bold">KYC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ?
              // Loading skeleton
              Array.from({
                length: 10
              }).map((_, i) => <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>) : filteredCasas.length === 0 ? <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma casa encontrada com os filtros selecionados
                    </TableCell>
                  </TableRow> : filteredCasas.map((casa, index) => <TableRow key={`${casa.casa}-${index}`} className="hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                        {casa.grupo || "-"}
                      </TableCell>
                      <TableCell className="font-medium">{casa.casa}</TableCell>
                      <TableCell className="text-center">
                        {casa.pa ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-muted-foreground/50 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-sm">{casa.tipoChavePix || "-"}</TableCell>
                      <TableCell>
                        {casa.estat ? <Badge variant="secondary" className="text-xs">
                            {casa.estat}
                          </Badge> : "-"}
                      </TableCell>
                      <TableCell className="text-sm">{casa.kyc || "-"}</TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>;
};