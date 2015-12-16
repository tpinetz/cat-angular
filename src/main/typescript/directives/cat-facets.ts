interface CatFacetsScope<T> extends IScope {
    catPaginatedController: ICatPaginatedController
    facetSelectOptions:Select2Options;
    listData:ICatListData<T>;
    names?:{[facetName:string]:string};
    facets?:{[facetName:string]:any};

    facetChanged(facet:Facet):void;
    facetName(facet:Facet):string;
    initFacets():void;
    isActive(facet:Facet):boolean;
}

class CatFacetsController<T> {

    constructor($scope:CatFacetsScope<T>) {
        $scope.isActive = (facet) => {
            return !!$scope.catPaginatedController.getSearch()[facet.name];
        };
        $scope.facetName = function (facet) {
            if ($scope.names !== undefined && $scope.names[facet.name] !== undefined) {
                return $scope.names[facet.name];
            } else {
                return facet.name;
            }
        };

        $scope.facets = {};

        let _search = (search?) => {
            return $scope.catPaginatedController.getSearchRequest().search(search);
        };

        $scope.facetChanged = function (facet) {
            let search = _search();
            let value = $scope.facets[facet.name];
            if (!!value) {
                search[facet.name] = value;
            } else {
                delete search[facet.name];
            }
        };

        $scope.initFacets = function () {
            _.forEach($scope.listData.facets, function (facet) {
                if ($scope.isActive(facet)) {
                    $scope.facets[facet.name] = $scope.catPaginatedController.getSearch()[facet.name];
                }
            });
        };

        $scope.facetSelectOptions = {
            allowClear: true
        };
    }
}

function catFacetsDirectiveFactory() {
    function _initDefaults(scope:CatFacetsScope<any>) {
        if (_.isUndefined(scope.listData)) {
            scope.listData = scope.$parent['listData'];
        }
    }

    function _checkConditions(scope:CatFacetsScope<any>) {
        if (_.isUndefined(scope.listData)) {
            throw new Error('listData was not defined and couldn\'t be found with default value');
        }

        if (_.isUndefined(scope.listData.facets)) {
            throw new Error('No facets are available within given listData');
        }
    }

    return {
        replace: true,
        restrict: 'E',
        scope: {
            listData: '=?',
            names: '='
        },
        require: '^catPaginated',
        templateUrl: 'template/cat-facets.tpl.html',
        link: function CatFacetsLink(scope:CatFacetsScope<any>,
                                     element:IAugmentedJQuery,
                                     attrs:IAttributes,
                                     catPaginatedController:ICatPaginatedController) {
            _initDefaults(scope);
            _checkConditions(scope);

            scope.catPaginatedController = catPaginatedController;
        },
        controller: [
            '$scope',
            CatFacetsController
        ]
    };
}

/**
 * @ngdoc directive
 * @name cat.directives.facets:catFacets
 */
angular
    .module('cat.directives.facets', [
        'cat.directives.paginated'
    ])
    .directive('catFacets', [
        catFacetsDirectiveFactory
    ]);
